define(['underscore', 'app', 'bootstrap'], function(_) {

	return ["$scope", "$route", "$location", "$http", "$q", "growl", function ($scope, $route, $location, $http, $q, growl) {

		$scope.toCommit  = toCommit;
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

			var qRequests = null;

			if(badge=="boxes") {

				qRequests = $http.get('/api/v2014/printsmart-requests', { params : { q : { completed:false } } });
			}
			else {

				qRequests = $http.get('/api/v2014/kronos/badges/'+escape(badge)).then(function(res) {

					return res.data;

				}).then(function(badgeInfo) {

					$scope.$root.contact = badgeInfo;

					return $http.get('/api/v2014/printsmart-requests', { params : { q : { participant : badgeInfo.ContactID, completed:false } } });

				}).then(function(res){

					var qBoxes = _.uniq(_.pluck(res.data, 'box'));

					if(qBoxes.length) // show all requests in the box(es)
						return $http.get('/api/v2014/printsmart-requests', { params : { q : JSON.stringify({ box : { $in : qBoxes }, completed:false }) } });
					else
						return res;
				})
			}


			qRequests.then(function(res) {

				var requests = res.data;

				if($scope.$root.contact) { // flag ready for clear

					_.each(requests, function(r){
						if(r.printedOn && r.participant == $scope.$root.contact.ContactID)
							flag(r, true);
					});
				}

				var qBoxGroup = _.groupBy(res.data, function(r){
					return r.participant +'|'+ r.box;
				});


				var boxes = _.map(qBoxGroup, function(requests) {
					return {
						box : _.first(requests).box,
						participant : _.first(requests).participant,
						participantName : _.first(requests).participantName,
						requests : requests
					};
				});

				$scope.allRequests = requests;
				$scope.boxes       = _.sortBy(boxes, function(b){

					if($scope.$root.contact && $scope.$root.contact.ContactID == b.participant)
						return ""; // Put current user at first

					return b.box+b.participantName;
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
		$scope.jobStatus = function (request) {
			var status = request.status ? request.status['job-state'] || 'pending' : 'pending';

			console.log(status)
			return status;
		};

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
		function toCommit(request) {

			return request.completed && !request.deliveredOn;
		}

		//=============================================
		//
		//
		//=============================================
		function commit(requests, closeOnSuccess) {

			var qPromises  = []
			var errorCount = 0;

			_.each(requests, function(request) {

				request.loading = true;

				qPromises.push($http.post('/api/v2014/printsmart-requests/'+request._id+'/deliveries', {}).then(function(res) {

					delete request.loading;

					_.extend(request, res.data);

				}).catch(function(err){

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

					if(closeOnSuccess)
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
