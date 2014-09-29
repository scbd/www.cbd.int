define(['underscore', 'directives/meetings/documents/in-session'], function(_) {
	return ["$scope", "$route", "$http", '$timeout', function ($scope, $route, $http, $timeout) {

		var loadTimeout = 10000;

		$scope.title = $route.current.$$route.title;

		//=============================================
		//
		//
		//=============================================
		function load() {

			$scope.loading = true;

			$http.get($route.current.$$route.documentsUrl, { timeout : loadTimeout }).success(function(data){

				delete $scope.loading;
				delete $scope.error;

				$scope.documents = _(data || []).map(function(d) {  //patch serie & tag

					d.group   = d.group || 'OTHER';
					d.visible = d.visible!==false ? true : false;

					return d;
				});

			}).error(function(data, status){

				if(status===0 && loadTimeout<15000) {

					$scope.error = "TIMEOUT";
					loadTimeout  = 30000;

					$timeout(load, 1000);

					return;
				}

				     if(status=== 0) $scope.error = "TIMEOUT-X";
				else if(status==404) $scope.error = "NOT_FOUND";
				else            $scope.error = "UNKNOWN";

				delete $scope.loading;

			});
		}

		//=============================================
		//
		//
		//=============================================
		$scope.reloadPage = function () {
			window.location.reload();
		}

		load();
	}];
});
