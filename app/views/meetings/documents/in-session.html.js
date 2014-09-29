define(['underscore', 'directives/meetings/documents/in-session'], function(_) {
	return ["$scope", "$route", "$http", '$timeout', function ($scope, $route, $http, $timeout) {

		function load() {

			$http.get($route.current.$$route.documentsUrl, {timeout:10000}).success(function(data){

				delete $scope.error;

				$scope.documents = _(data || []).map(function(d) {  //patch serie & tag

					d.group   = d.group || 'OTHER';
					d.visible = d.visible!==false ? true : false;

					return d;
				});

			}).error(function(data, status){

				     if(status==  0) { $scope.error = "TIMEOUT"; $timeout(load, 1000); }
				else if(status==404) { $scope.error = "NOT_FOUND"; }
				else if(status==404) { $scope.error = "UNKNOWN";  }

			});
		}

		load();
	}];
});
