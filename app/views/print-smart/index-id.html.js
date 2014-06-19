define(['underscore', 'app', 'bootstrap'], function(_) {

	return ["$scope", "$route", "$location", "$http", "$q", function ($scope, $route, $location, $http, $q) {

		$scope.badge     = null;
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


			$scope.boxes = null;
			$scope.requests = null;

			{ // mock data
				$scope.badge = badge;
				$scope.requests = [
				{
					id : "463785432",
					documentSymbol: "WGRI/05/ZYZ",
					documentLanguage : "zh",
					createdOn : function() { var d =  new Date(); d.setDate(17); return d; }(),
					box        : "045",
					deliveredOn : new Date()
				},
				{
					id : "54543",
					documentSymbol: "WGRI/05/543",
					documentLanguage : "en",
					createdOn : function() { var d =  new Date(); d.setDate(15); return d; }(),
					box        : "045",
					deliveredOn : new Date()
				},
				{
					id : "435543",
					documentSymbol: "WGRI/05/32543432",
					documentLanguage : "en",
					createdOn : function() { var d =  new Date(); d.setDate(12); return d; }(),
					box        : "052",
					deliveredOn : new Date()
				},
				{
					id : "7754",
					documentSymbol: "WGRI/05/7765",
					documentLanguage : "fr",
					createdOn : function() { var d =  new Date(); d.setDate(12); return d; }(),
					box        : "052"
				}
				];

				$scope.boxes = _.map(_.groupBy($scope.requests, "box"), function(val, key){
					return { 
						id : key,
						requests : val
					};
				});

				return;
			}

			$http.get('/api/v2014/printsmartrequests/', { params : { q : { badge : badge } } }).success(function(requests) {

				$scope.badge    = badge;
				$scope.requests = requests;

			}).error(function(data) {

				$scope.error = data;
				$location.path("/internal/printsmart");
				$location.hash("INVALID_BADGE_ID");
			});
		}


		$scope.flagCompleted = function (element, value) {

			if(!element)
				return;

			if(!_.isArray(element)) {

				element.isComplete = value;
			}
			else {

				_.each(element, function(r) {
					if(r.deliveredOn)
						r.isComplete = value;
				});
			}
		};

		$scope.clearCompleted = function () {

			var qPendingQueries = [];

			angular.forEach($scope.requests, function (r) {
				if(r.isComplete)
					qPendingQueries.push($http.post('/api/v2014/printsmartrequests/'+r.id+'/deliveries', {}));
			});

			$q.all(qPendingQueries).then(function(){
				$location.path('/internal/papersmart');
			});
		};

		$scope.close = function () {
			$location.path("/internal/printsmart");
			$location.hash("");
		};
		
		$scope.fixDate = function (dt) {
			return dt ? new Date(dt) : dt;
		};
	}];
});