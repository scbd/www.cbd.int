define(['underscore', 'angular', 'jquery', 'data/in-session/meetings', 'directives/meetings/documents/in-session', 'bootstrap-notify', 'authentication'], function(_, ng, $, meetings) {
	return ["$scope", "$route", "$http", '$q', '$timeout', '$location', 'authentication', function ($scope, $route, $http, $q, $timeout, $location, authentication) {

		var refreshTimeout = 2*60*1000; // 2 minutes
        var refreshTimer = null;

		$scope.meeting = lookupMeeting($route.current.params.meeting);

		if(!$scope.meeting)
			return;

		$q.when(authentication.getUser()).then(function(u){
			$scope.isAdmin = !!_.intersection(u.roles, ["Administrator","EditorialService"]).length;
		});

		//=============================================
		//
		//
		//=============================================
		function lookupMeeting(code)
		{
			var meeting = _.find(meetings, function(m) {
				return code.toUpperCase() == m.code.toUpperCase() ||
					   code.toUpperCase() == m.code.toUpperCase().replace(/-/g, "");
			});

			if(!meeting) {
				$location.url("/404");
				return;
			}

			if(meeting.code!=code) {
				$location.url("/"+meeting.code);
				return;
			}

			return _.clone(meeting, true); //deep clone
		}

		//=============================================
		//
		//
		//=============================================
		$scope.totalDocuments = function () {

			return _($scope.meeting.sections).filter($scope.isVisible).reduce(function(sum, section){

				return sum + _.where($scope.documents, { section : section.code }).length;

			}, 0);
		};

		//=============================================
		//
		//
		//=============================================
		$scope.unlock = function () {

			throw "TO RE-IMPLEMENT";

			// var lockedSections = _.filter(meeting.sections, function(s){
			// 	delete s.error;
			// 	return s.status==="RESTRICTED";
			// });
			//
			// var queries = _(lockedSections).map(function(s){
			//
			// 	return loadDocuments(s).then(function(d){
			//
			// 		if(d=="RESTRICTED")
			// 			s.error =  "INVALID_BADGE_ID";
			// 	});
			// });
		};

		//=============================================
		//
		//
		//=============================================
		$scope.isVisible = function (section) {

			var visible    = section.visible   || section.visible===undefined;
			var hasDocs    = _($scope.documents||[]).some({ section : section.code });

			return visible && hasDocs;
		};

		//=============================================
		//
		//
		//=============================================
		function load() {

			var query = {
				q : {
					meeting : $scope.meeting.code,
					section : { $in : _.pluck($scope.meeting.sections, "code") }
				},
				s : {
					section : 1,
					position : 1
				}
			};

			return $http.get("/api/v2015/insession-documents", { params : query }).then(function(res){

				$scope.documents = _(res.data || []).map(function(d) {  //patch serie & tag

					d.visible = d.visible!==false ? true : false;

					return d;

				}).filter(function(d) {

					return d.visible && d.locales && d.locales.length;

				}).value();

				return $scope.documents;

			}).catch(function(e) {

				$scope.error = "ERROR:"+(e||'').toString();

			});

		}

		//=============================================
		//
		//
		//=============================================
		function refresh() {

			if($('.modal:visible').size()===0) {

				return load().finally(function(){
					refreshTimer = $timeout(refresh, refreshTimeout);
				});
			}
			else {
				refreshTimer = $timeout(refresh, refreshTimeout);
			}
		}

        //=============================================
		//
		//
		//=============================================
        $scope.$on("$destroy", function() {
            $timeout.cancel(refreshTimer);
        });

		//=============================================
		//
		//
		//=============================================
		$scope.$watch("documents", function(_new, _old) {

			if(!_.isArray(_new) || !_.isArray(_old))
				return;

			var now   = new Date();
			var time  = now.getHours() + ":" + now.getMinutes();
			var count = 0;
			var message = null;

			if(_new.length > _old.length) {
				count   = _new.length - _old.length;
				message = time + ' - '+count+' new document(s) available';
			}

			if(_new.length>0 && _new.length == _old.length) {

				var o = _.map(_old, function(d) { return ng.toJson(_.pick(d, ["symbol","superseded","item","title","alert","warning","info","filePattern","locales"])); });
				var n = _.map(_new, function(d) { return ng.toJson(_.pick(d, ["symbol","superseded","item","title","alert","warning","info","filePattern","locales"])); });

				count = _.difference(n, o).length;

				if(count)
					message = time + ' - '+count+' document(s) updated';
			}

			if(message) {
				$.notify({ message: message, icon: "fa fa-files-o" }, {
					delay: 10000,
					type: 'info',
					placement : { align : "center" },
					animate: {
						enter: 'animated bounceInDown',
						exit: 'animated bounceOutUp'
					},
				});
			}

			$timeout(function(){
				$scope.$broadcast('printsmart-refresh');
			}, 500);
		});

		refresh();
	}];
});
