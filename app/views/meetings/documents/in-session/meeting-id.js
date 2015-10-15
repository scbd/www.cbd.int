define(['underscore', 'nprogress', 'angular', 'jquery', 'data/in-session/meetings', 'directives/meetings/documents/in-session', 'angular-growl'], function(_, nprogress, ng, $, meetings) {
	return ["$scope", "$route", "$http", '$q', '$timeout', '$location', 'growl', function ($scope, $route, $http, $q, $timeout, growl, $location) {

		var refreshTimeout = 2*60*1000; // 2 minutes
		var meeting        = _.findWhere(meetings, { code : $route.current.params.meeting });

		if(!meeting) {
			$location.url("/404");
			return;
		}

		meeting = _.clone(meeting, true);
		$scope.meeting = meeting;

		//=============================================
		//
		//
		//=============================================
		$scope.totalDocuments = function () {

			return _(meeting.sections).filter($scope.isVisible).reduce(function(sum, section){

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
			// if(lockedSections.length)
			// 	nprogress.start();
			//
			// var queries = _(lockedSections).map(function(s){
			//
			// 	return loadDocuments(s).then(function(d){
			//
			// 		if(d=="RESTRICTED")
			// 			s.error =  "INVALID_BADGE_ID";
			// 	});
			// });
			//
			// $q.all(queries).finally(function() {
			// 	nprogress.done();
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

		//==============================================
		//
		//
		//==============================================
		function cleanBadge(code) {
			return (code||$scope.$root.badgeCode||"").replace(/[^0-9]/g, "");
		}

		//=============================================
		//
		//
		//=============================================
		function load() {

			nprogress.start();

			var query = {
				q : {
					meeting : meeting.code,
					section : { $in : _.pluck(meeting.sections, "code") }
				},
				s : {
					section : 1,
					position : 1
				}
			};

			return $http.get("/api/v2015/insession-documents", { params : query, headers : { badge : cleanBadge() } }).then(function(res){

				$scope.documents = _(res.data || []).map(function(d) {  //patch serie & tag

					d.visible = d.visible!==false ? true : false;

					return d;

				}).filter(function(d) {

					return d.visible && d.locales && d.locales.length;

				}).value();

				return $scope.documents;

			}).catch(function(e) {

				$scope.error = "ERROR:"+(e||'').toString();

			}).finally(function() {

				nprogress.done();
				$timeout(refresh, refreshTimeout);
			});

		}

		//=============================================
		//
		//
		//=============================================
		function refresh() {

			if($('.modal:visible').size()===0) {

				return load().finally(function(){
					$timeout(refresh, refreshTimeout);
				});
			}
			else {
				$timeout(refresh, refreshTimeout);
			}
		}

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

			if(_new.length > _old.length) {

				count = _new.length - _old.length;

				growl.addInfoMessage(time + ' - '+count+' new document(s) available', { ttl: 10000 });
			}

			if(_new.length>0 && _new.length == _old.length) {

				var o = _(_old).map(function(d) { return ng.toJson(d); });
				var n = _(_new).map(function(d) { return ng.toJson(d); });

				count = _.difference(n, o).length;

				if(count) {
					growl.addInfoMessage(time + ' - '+count+' document(s) updated', { ttl: 10000 });
				}
			}

			$timeout(function(){
				$scope.$broadcast('printsmart-refresh');
			}, 500);
		});

		refresh();
	}];
});
