define([], function(app) {

	return ["$scope", "$route", "$location", "$http", "$q", function ($scope, $route, $location, $http, $q) {

	    $scope.badge = $route.current.params.badge;

	    $scope.printsmartRequests = [];
	    $scope.remainingCount = 0;

	    $http.get('/api/v2014/printsmartrequests/?q={"badge":"'$scope.badge'"}/').success(function(data) {
	        $scope.printsmartRequests = data;
	    }).error(function(data) {
	    	$scope.error = data;
	    });


	    $scope.clearCompleted = function () {

	    	var qPendingQueries = [];

	    	angular.forEach($scope.printsmartRequests, function (r) {
	    		if(r.isComplete)
	    			qPendingQueries.push($http.post('/api/v2014/printsmartrequests/'+r.id+'/deliveries', {}));
	    	});

	    	$q.all(qPendingQueries).then(function(){
				$location.
	    	});
	    }

	    $scope.fixDate = function (dt) {
	        return dt ? new Date(dt) : dt;
	    }

	}];
});