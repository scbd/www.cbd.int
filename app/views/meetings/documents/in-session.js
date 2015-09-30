define(['underscore', 'nprogress', 'angular', 'jquery' ,'directives/meetings/documents/in-session', 'angular-growl'], function(_, nprogress, ng, $) {
	return ["$scope", "$route", "$http", '$q', '$timeout', 'growl', function ($scope, $route, $http, $q, $timeout, growl) {

		$scope.title        = $route.current.$$route.title;
		$scope.intro        = $route.current.$$route.intro;
		$scope.sections     = JSON.parse(JSON.stringify($route.current.$$route.documents)); //clone
		$scope.sectionsKeys = _.keys($scope.sections);

		var refreshTimeout = 2*60*1000; // 2 minutes

		//=============================================
		//
		//
		//=============================================
		$scope.totalDocuments = function () {

			return _($scope.sections).reduce(function(sum, v){

				return sum + (v.documents||[]).length;

			}, 0);
		};

		//=============================================
		//
		//
		//=============================================
		$scope.unlock = function () {

			var lockedSections = _($scope.sections).filter(function(s){
				delete s.error;
				return s.status==="RESTRICTED";
			});

			if(lockedSections.length)
				nprogress.start();

				console.log(lockedSections);


			var queries = _(lockedSections).map(function(s){

				return loadDocuments(s).then(function(d){

					if(d=="RESTRICTED")
						s.error =  "INVALID_BADGE_ID";
				});
			});

			$q.all(queries).finally(function() {
				nprogress.done();
			});
		};

		//=============================================
		//
		//
		//=============================================
		$scope.allLoaded = function () {

			return _(_($scope.sections).pluck('documents')).every();
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

			var queries = _.map($scope.sections, loadDocuments);

			$q.all(queries).then(function() {

				delete $scope.error;

			}).catch(function(e) {

				$scope.error = "ERROR:"+(e||'').toString();

			}).finally(function() {

				nprogress.done();
			});

			$timeout(refresh, refreshTimeout);
		}

		//=============================================
		//
		//
		//=============================================
		function loadDocuments(section) {

			section.loading = true;

			return $http.get(section.url, { headers : { badge : cleanBadge() } }).then(function(res){

				var docs = _.chain(res.data || []).map(function(d) {  //patch serie & tag

					d.visible = d.visible!==false ? true : false;

					return d;

				}).filter(function(d) {

					return d.visible && d.locales && d.locales.length;

				}).value();

				if(ng.toJson(docs) == ng.toJson(section.documents)) // do not update if values are ==
					return section.documents;

				return docs;

			}).catch(function(res) {

				if(res && res.status==403) return "RESTRICTED";
				if(res && res.status==404) return [];

				throw "UNKNOWN_ERROR";

			}).then(function(docs){

				if(docs == "RESTRICTED")                    section.status = "RESTRICTED";
				if(section.status &&  docs != "RESTRICTED") section.status = "UNRESTRICTED";

				section.documents = docs;

				return docs;

			}).finally(function(){
				delete section.loading;
			});
		}

		//=============================================
		//
		//
		//=============================================

		var refreshKeys  = _.keys($scope.sections);

		function refresh() {

			if($('.modal:visible').size()===0) {

				refreshKeys.push(refreshKeys.shift());

				var section = $scope.sections[refreshKeys[0]];
				var oldDocs  = section.documents;

				loadDocuments(section).then(function(newDocs) {

					if(newDocs!=oldDocs)
						applyChanges(newDocs, oldDocs);

				}).finally(function(){

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
		function applyChanges(_new, _old) {

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
		}

		load();
	}];
});
