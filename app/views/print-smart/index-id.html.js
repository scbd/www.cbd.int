define(['underscore', 'app', 'bootstrap'], function(_) {

	return ["$scope", "$route", "$location", "$http", "$q", "growl", function ($scope, $route, $location, $http, $q, growl) {

		$scope.requestsToCommit = requestsToCommit;
		$scope.allRequests      = allRequests;
		$scope.commit    = commit;
		$scope.flag      = flag;
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

		//=============================================
		//
		//
		//=============================================
		function load(badge) {

			$scope.boxes    = null;
			$scope.error    = null;
			$scope.loading  = true;

			$http.get('/api/v2014/kronos/badges/'+escape(badge)).then(function(res) {

				return res.data;

			}).then(function(badgeInfo) {

				$scope.$root.contact = badgeInfo;

				return $http.get('/api/v2014/printsmart-requests', { params : { q : { participant : badgeInfo.ContactID, completed:false } } });

			}).then(function(res) {

				var requests = res.data;

				_.each(requests, function(r){
					if(r.printedOn)
						flag(r, true);
				});

				$scope.boxes = _.map(_.groupBy(res.data, "box"), function(val, key){
					return { 
						id : key,
						requests : val
					};
				});

				$scope.loading = false;

			}).catch(function(err) {

				console.log("error", err);
				$scope.loading = false;
				$scope.error = err;

				angular.element("#close").focus();
			});
		}

		//=============================================
		//
		//
		//=============================================
		function flag(request, value) {
			request.completed = (!!value || !!request.deliveredOn);
		};

		//=============================================
		//
		//
		//=============================================
		function requestsToCommit() {
			
			var requests = [];

			_.each(allRequests(), function(r) {

				if(!!r.completed && !r.deliveredOn)
					requests.push(r);
			});

			return requests;
		}

		//=============================================
		//
		//
		//=============================================
		function allRequests() {
			
			return _.flatten(_.pluck($scope.boxes, "requests"));
		}

		//=============================================
		//
		//
		//=============================================
		function commit() {

			var qPromises  = []
			var errorCount = 0;
			var requests   = requestsToCommit();

			_.each(requests, function(request) {

				request.loading = true;

				qPromises.push($http.post('/api/v2014/printsmart-requests/'+request._id+'/deliveries', {}).then(function(res) {
					debugger;
					delete request.loading;

					_.extend(request, res.data);

				}).catch(function(err){
					debugger;
					errorCount++;

					delete request.loading;

					growl.addErrorMessage("Error with document: "+request.documentSymbol);

					console.log(err);

				}));
			});

			$q.all(qPromises).then(function(){

				if(errorCount==0)
				{
					growl.addSuccessMessage(''+requests.length+' document(s) cleared!', {ttl: 2000});
					close();
				}
			})
		};

		//=============================================
		//
		//
		//=============================================
		function close() {
			$location.path("/internal/printsmart");
		};

		//=============================================
		//
		//
		//=============================================
		$scope.printed = function (r) {
			return !!r.printedOn;
		}

		//=============================================
		//
		//
		//=============================================
		$scope.fixDate = function (dt) {
			return dt ? new Date(dt) : dt;
		};

		//=============================================
		//
		// ERRORS
		//
		//=============================================
		$scope.isNotAuthorized = function() {
			return $scope.error && 
				   $scope.error.status==403;
		}

		$scope.isBadgeInvalid = function() {
			return $scope.error && 
				   $scope.error.data && 
				   $scope.error.data.error=='INVALID_BADGE_ID';
		}

		$scope.isOtherError = function() {
			return $scope.error && 
				  !$scope.isNotAuthorized() &&
				  !$scope.isBadgeInvalid();
		}

	}];
});