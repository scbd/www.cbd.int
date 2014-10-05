define(['underscore', 'nprogress', 'angular', 'jquery' ,'directives/meetings/documents/in-session'], function(_, nprogress, ng, $) {
	return ["$scope", "$route", "$http", '$q', '$timeout', 'growl', function ($scope, $route, $http, $q, $timeout, growl) {

		var sections = [ 'plenary', 'wg1', 'wg2', 'other', 'presentations' ];

		_(sections).each(function(s){

			$scope.$watch(s.toUpperCase(), applyChanges);

		});

		//=============================================
		//
		//
		//=============================================
		function load() {

			nprogress.start();

			var queries = _(sections).map(loadDocuments);

			$q.all(queries).then(function() {

				delete $scope.error;

			}).catch(function() {

				$scope.error = "ERROR";

			}).finally(function() {

				nprogress.done();
			});

			$timeout(refresh, 30*1000);
		}

		//=============================================
		//
		//
		//=============================================
		function loadDocuments(name) {

			var field = name.toUpperCase();
			var url   = $route.current.$$route.documentsUrl + name + '.json';

			return $http.get(url).then(function(res){

				var docs = _.chain(res.data || []).map(function(d) {  //patch serie & tag

					d.visible = d.visible!==false ? true : false;

					return d;

				}).where({ visible : true }).value();

				var oldDocs = $scope[field];

				if(ng.toJson(oldDocs) != ng.toJson(docs))
					return docs;

				return $scope[field];

			}).catch(function(res) {

				if(res && res.status==403) return "RESTRICTED";
				if(res && res.status==404) return [];

				throw "UNKNOWN_ERROR";
			}).then(function(docs){

				$scope[field] = docs;
			});
		}

		//=============================================
		//
		//
		//=============================================
		function refresh() {

			sections.push(sections.shift());

			if($('.modal:visible').size()===0)
				loadDocuments(sections[0]);

			$timeout(refresh, 30*1000);
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

		//=============================================
		//
		//
		//=============================================
		$scope.reloadPage = function () {
			window.location.reload();
		};

		load();
	}];
});
