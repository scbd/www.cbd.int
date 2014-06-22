define(['app', 'angular', 'underscore'], function(app, angular, _) {

	app.directive('printSmartDialog', ["$http", "$timeout", function($http, $timeout) {
		return {
			restrict : "AEC",
			require: '^printSmart',
			replace : true,
			scope :  {},
			templateUrl : "/app/views/print-smart/print-smart-dialog.html",
			link: function ($scope, element, attrs, psCtrl) {

				element.on("show.bs.modal", function() {
					$scope.documents = psCtrl.documents();
					$scope.badgeCode = "";
					$scope.error     = null;
					$scope.success   = null;
					$scope.target    = null;
				});

				$scope.preferedLanguage = "en";
				$scope.badgeCode        = "";
				$scope.cleanBadge       = cleanBadge;
				$scope.clearError       = clearError;
				$scope.isNetworkCall    = false;

				$scope.languages = [
					{ code : "ar", name : "العربية" },
					{ code : "en", name : "English" },
					{ code : "es", name : "Español" },
					{ code : "fr", name : "Français" },
					{ code : "ru", name : "Русский" },
					{ code : "zh", name : "中文" },
				];

				//==============================================
				//
				//
				//==============================================
				function cleanBadge() {
					return ($scope.badgeCode||"").replace(/[^0-9]/g, "");
				}

				//==============================================
				//
				//
				//==============================================
				function clearError() {
					$scope.error = null;
				}

				//==============================================
				//
				//
				//==============================================
				$scope.canPrint = function() {
					return cleanBadge().length >= 8 &&
						   $scope.documents.length > 0 &&
						   !!$scope.preferedLanguage;
				};

				//==============================================
				//
				//
				//==============================================
				function prepareDocuments()	{

					return  _.map($scope.documents, function(d) {
						return {
							symbol   : d.symbol,
							url      : d.urls[$scope.preferedLanguage] || d.urls.en,
							language : d.urls[$scope.preferedLanguage] ? $scope.preferedLanguage : "en"
						};
					});
				}

				//==============================================
				//
				//
				//==============================================
				$scope.download = function() {

					_.each(prepareDocuments(), function(d){
						angular.element("body").append('<iframe src="'+d.url+'?download" style="display:none"></iframe>');
					});

					if(cleanBadge()=="")
						$scope.close(true);
				}

				//==============================================
				//
				//
				//==============================================
				$scope.print = function() {

					$scope.error = null;
					$scope.success = null;

					var postData = {
						badge     : cleanBadge(),
						documents : prepareDocuments()
					};

					$scope.isNetworkCall = true;

					$http.post("/api/v2014/printsmart-requests/batch", postData).success(function(data) {

						$scope.isNetworkCall = false;
						$scope.success       = angular.isObject(data) ? data : {};

					}).error(function(data, status){

						$scope.isNetworkCall = false;

						if(angular.isObject(data)) $scope.error = data
						else if(status==404)       $scope.error = { error: "NO_SERVICE" };
						else if(status==500)       $scope.error = { error: "NO_SERVICE" };
						else                       $scope.error = { error: "UNKNOWN",    message : "Unknown error" };
					});
				};

				//==============================================
				//
				//
				//==============================================
				$scope.isCustomError = function() {

					if(!$scope.error)
						return false;

					return $scope.error.error!="INVALID_BADGE_ID" &&
						   $scope.error.error!="INVALID_BADGE_REVOKED" && 
						   $scope.error.error!="INVALID_BADGE_EXPIRED" &&
						   $scope.error.error!="NO_SERVICE";
				}

				//==============================================
				//
				//
				//==============================================
				$scope.close = function(clear) {

					if(!!clear)
						psCtrl.clear();

					psCtrl.print(false);
				};
			}
		};
	}]);
});