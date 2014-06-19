define(['underscore', 'app', 'bootstrap'], function(_) {

	return ["$scope", "$route", "$location", "$http", "$q", function ($scope, $route, $location, $http, $q) {

	    $scope.badge              = null;
	    $scope.printsmartRequests = [];
	    $scope.languages = {
			"ar" : "العربية / Arabic" ,
			"en" : "English" ,
			"es" : "Español / Spanish" ,
			"fr" : "Français / French" ,
			"ru" : "Русский / Russian" ,
			"zh" : "中文 / Chinese"
		};

		load($route.current.params.badge);

		function load(badge) {

			 $scope.badge = badge;
			 $scope.printsmartRequests = [
			 {
			 	id : "463785432",
			 	documentSymbol: "WGRI/05/ZYZ",
			 	documentLanguage : "zh",
			 	createdOn : function() { var d =  new Date(); d.setDate(17); return d; }(),
			 	deliveredOn : new Date()
			 },
			 {
			 	id : "54543",
			 	documentSymbol: "WGRI/05/543",
			 	documentLanguage : "en",
			 	createdOn : function() { var d =  new Date(); d.setDate(15); return d; }(),
			 	deliveredOn : new Date()
			 },
			 {
			 	id : "7754",
			 	documentSymbol: "WGRI/05/7765",
			 	documentLanguage : "fr",
			 	createdOn : function() { var d =  new Date(); d.setDate(12); return d; }(),
			 },
			 ];
			 return;

		    $http.get('/api/v2014/printsmartrequests/', { params : { q : { badge : badge } } }).success(function(data) {

		    	$scope.badge = badge;
		        $scope.printsmartRequests = data;
		        
		    }).error(function(data) {

		    	$scope.error = data;
		    	$location.path("/internal/printsmart");
		    	$location.hash("INVALID_BADGE_ID");
		    });
		}


	    $scope.flagCompleted = function (elements, value) {
		
			if(!elements)
				return;

			if(!_.isArray(elements))
				elements = [elements];

			_.each(elements, function(r) {
			 	if(r.deliveredOn)
			 		r.isComplete = value;
			 });
		};

	    $scope.clearCompleted = function () {

	    	var qPendingQueries = [];

	    	angular.forEach($scope.printsmartRequests, function (r) {
	    		if(r.isComplete)
	    			qPendingQueries.push($http.post('/api/v2014/printsmartrequests/'+r.id+'/deliveries', {}));
	    	});

	    	$q.all(qPendingQueries).then(function(){
				$location.path('/internal/papersmart');
	    	});
	    };

	    $scope.fixDate = function (dt) {
	        return dt ? new Date(dt) : dt;
	    };
	}];
});