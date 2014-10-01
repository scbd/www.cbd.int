define(['underscore', 'nprogress', 'directives/meetings/documents/in-session'], function(_, nprogress) {
	return ["$scope", "$route", "$http", '$q', function ($scope, $route, $http, $q) {

		//=============================================
		//
		//
		//=============================================
		function load() {

			nprogress.start();

			var queries = [
				loadDocuments('plenary'),
				loadDocuments('wg1'),
				loadDocuments('wg2'),
				loadDocuments('other'),
				loadDocuments('presentations')
			];

			$q.all(queries).then(function() {

				delete $scope.error;

			}).catch(function() {

				$scope.error = "ERROR";

			}).finally(nprogress.done);

		}

		//=============================================
		//
		//
		//=============================================
		function loadDocuments(name) {

			var url   = $route.current.$$route.documentsUrl + name + '.json';
			var field = name.toUpperCase();

			$http.get(url).success(function(data){

				$scope[field] = _.chain(data || []).map(function(d) {  //patch serie & tag

					d.group   = d.group || 'OTHER';
					d.visible = d.visible!==false ? true : false;

					return d;

				}).where({

					visible : true

				}).value();

			}).error(function(data, status) {

				     if(status==403) $scope[field] = "RESTRICTED";
				else if(status==404) $scope[field] = [];
				else  throw "UNKNOWN_ERROR";
			});
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
