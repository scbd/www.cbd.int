define(['angular'], function(angular) {
	return ["$scope", "$location", "$timeout", function ($scope, $location, $timeout) {

		angular.element("#badge").focus();

	    $scope.error  = error;
	    $scope.submit = function () {

	    	clearError();

	    	if($scope.badge)
	    	   	$location.path('/internal/printsmart/'+$scope.badge);
	    }

	    if(error()) {
	    	qError = $timeout(clearError, 10000);
	    }


	    function error() {
	    	return $location.hash();
	    }

	    function clearError() {
	    	if(qError) {
	    		$timeout.cancel(qError);
	    		qError = null;
	    	}

	    	 $location.hash(null);
	    }

	}];
});