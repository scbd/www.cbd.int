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
					$scope.badgeCode = "";
					$scope.error     = null;
					$scope.success   = null;
					$scope.target    = null;
					$scope.documents = psCtrl.documents();
					$scope.localizedDocuments = {
						ar : mapDocuments(psCtrl.documents(), 'ar'),
						en : mapDocuments(psCtrl.documents(), 'en'),
						es : mapDocuments(psCtrl.documents(), 'es'),
						fr : mapDocuments(psCtrl.documents(), 'fr'),
						ru : mapDocuments(psCtrl.documents(), 'ru'),
						zh : mapDocuments(psCtrl.documents(), 'zh'),
					};
				});

				$scope.preferedLanguage = "en";
				$scope.badgeCode        = "";
				$scope.cleanBadge       = cleanBadge;
				$scope.clearError       = clearError;
				$scope.isNetworkCall    = false;
				$scope.multiDownloads   = /chrom(e|ium)/i.test(navigator.userAgent) ||
										  /safari/i      .test(navigator.userAgent);

				$scope.languages = {
					ar : "العربية",
					en : "English",
					es : "Español",
					fr : "Français",
					ru : "Русский",
					zh : "中文"
				};

				//==============================================
				//
				//
				//==============================================
				function mapDocuments(documents, lang)	{
					return  _.map(documents, function(d) {
						return {
							symbol   : d.symbol,
							url      : d.urls[lang] || d.urls.en,
							language : d.urls[lang] ? lang : "en"
						};
					});
				}

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
				$scope.download = function() {

					_.each($scope.localizedDocuments[$scope.preferedLanguage], function(d){
						d.downloaded = true;
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
						documents : $scope.localizedDocuments[$scope.preferedLanguage]
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