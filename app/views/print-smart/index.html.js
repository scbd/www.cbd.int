define([], function(app) {
	return ["$scope", "$location", function ($scope, $location) {
	    $scope.go = function () {
	    	$location.path('/internal/printsmart/'+$scope.badge);
	    }
	}];
});