define(['app', 'angular', 'underscore'], function(app, angular, _) {

	app.directive('printSmartDialog', ["$http", function($http) {
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
					$scope.target    = $scope.canDownload ? null : "print";
					$scope.format    = "doc";
					$scope.documents = psCtrl.documents();
					$scope.localizedDocuments = {
						pdf : {
							ar : mapDocuments(psCtrl.documents(), 'pdf', 'ar'),
							en : mapDocuments(psCtrl.documents(), 'pdf', 'en'),
							es : mapDocuments(psCtrl.documents(), 'pdf', 'es'),
							fr : mapDocuments(psCtrl.documents(), 'pdf', 'fr'),
							ru : mapDocuments(psCtrl.documents(), 'pdf', 'ru'),
							zh : mapDocuments(psCtrl.documents(), 'pdf', 'zh')
						},
						doc: {
							ar : mapDocuments(psCtrl.documents(), 'doc', 'ar'),
							en : mapDocuments(psCtrl.documents(), 'doc', 'en'),
							es : mapDocuments(psCtrl.documents(), 'doc', 'es'),
							fr : mapDocuments(psCtrl.documents(), 'doc', 'fr'),
							ru : mapDocuments(psCtrl.documents(), 'doc', 'ru'),
							zh : mapDocuments(psCtrl.documents(), 'doc', 'zh')
						}
					};
				});

				$scope.preferedLanguage = "en";
				$scope.badgeCode        = "";
				$scope.cleanBadge       = cleanBadge;
				$scope.clearError       = clearError;
				$scope.isNetworkCall    = false;
				$scope.canDownload      = !/mobile/i .test(navigator.userAgent) && 
										  !/android/i.test(navigator.userAgent) &&
										  !/tablet/i .test(navigator.userAgent) &&
										  !/phone/i  .test(navigator.userAgent) &&
										  !/RIM/     .test(navigator.userAgent);

				$scope.multiDownloads   = $scope.canDownload &&
										  (/chrom(e|ium)/i.test(navigator.userAgent) ||
										   /safari/i      .test(navigator.userAgent));


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
				function mapDocuments(documents, slot, lang)	{

					return  _.map(documents, function(d) {
						return {
							symbol   : d.symbol,
							url      : d.urls[slot][lang] || d.urls[slot].en,
							language : d.urls[slot][lang] ? lang : "en"
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

					_.each($scope.localizedDocuments[$scope.format][$scope.preferedLanguage], function(d){
						d.downloaded = true;
						angular.element("body").append('<iframe src="'+d.url+'?download" style="display:none"></iframe>');
					});

					if(cleanBadge()==="")
						$scope.close(true);
				};

				//==============================================
				//
				//
				//==============================================
				$scope.print = function() {

					$scope.error = null;
					$scope.success = null;

					var postData = {
						badge     : cleanBadge(),
						documents : $scope.localizedDocuments.pdf[$scope.preferedLanguage]
					};

					$scope.isNetworkCall = true;

					$http.post("/api/v2014/printsmart-requests/batch", postData).success(function(data) {

						$scope.isNetworkCall = false;
						$scope.success       = angular.isObject(data) ? data : {};

					}).error(function(data, status){

						$scope.isNetworkCall = false;

						if(angular.isObject(data)) $scope.error = data;
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

					return $scope.error.error!=="INVALID_BADGE_ID" &&
						   $scope.error.error!=="INVALID_BADGE_REVOKED" && 
						   $scope.error.error!=="INVALID_BADGE_EXPIRED" &&
						   $scope.error.error!=="NO_SERVICE";
				};

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