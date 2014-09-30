define(['underscore', 'nprogress', 'directives/meetings/documents/in-session'], function(_, nprogress) {
	return ["$scope", "$route", "$http", '$timeout', function ($scope, $route, $http, $timeout) {

		var loadTimeout = 10000;

		//=============================================
		//
		//
		//=============================================
		function load() {

			nprogress.start();

			$http.get($route.current.$$route.documentsUrl, { timeout : loadTimeout }).success(function(data){

				nprogress.done();

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

				nprogress.done();
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
