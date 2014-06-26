define(['app', 'angular', 'underscore'], function(app, angular, _) {

	app.directive('printSmartDialog', ["$http", "$cookies", function($http, $cookies) {
		return {
			restrict : "AEC",
			require: '^printSmart',
			replace : true,
			scope :  {},
			templateUrl : "/app/views/print-smart/print-smart-dialog.html",
			link: function ($scope, element, attrs, psCtrl) {

				$scope.cleanBadge       = cleanBadge;
				$scope.clearError       = clearError;
				$scope.isNetworkCall    = false;
				$scope.isKiosk          = !!$cookies.kiosk;
				$scope.isMobileDevice   = /mobile/i .test(navigator.userAgent) ||
										  /android/i.test(navigator.userAgent) ||
										  /tablet/i .test(navigator.userAgent) ||
										  /phone/i  .test(navigator.userAgent) ||
										  /RIM/     .test(navigator.userAgent);
				$scope.canDownload = !$scope.isKiosk &&
									 !$scope.isMobileDevice;

				var allLanguages = {
					ar : "العربية",
					en : "English",
					es : "Español",
					fr : "Français",
					ru : "Русский",
					zh : "中文"
				};


				$scope.$watch('target',           initDownloadLink);
				$scope.$watch('format',           initDownloadLink);
				$scope.$watch('preferedLanguage', initDownloadLink);

				element.on("show.bs.modal", function() {
					$scope.preferedLanguage = "en";
					$scope.badgeCode = "";
					$scope.error     = null;
					$scope.success   = null;
					$scope.target    = $scope.canDownload ? null : "print";
					$scope.format    = "doc";
					$scope.downloadLink = null;
					$scope.documents = psCtrl.documents();
					$scope.languages = {};
					$scope.localizedDocuments = { pdf : {}, doc : {} };

					_.each(documentsLocales($scope.documents), function(locale) {

						$scope.languages             [locale] = allLanguages[locale];
						$scope.localizedDocuments.pdf[locale] = mapDocuments($scope.documents, 'pdf', locale);
						$scope.localizedDocuments.doc[locale] = mapDocuments($scope.documents, 'doc', locale);
					});
				});


				//==============================================
				//
				//
				//==============================================
				function initDownloadLink()	{

					$scope.downloadLink = null;

					if( $scope.target!='download') return;
					if(!$scope.preferedLanguage) return;
					if(!$scope.format) return;

					var urls = _.compact(_.map($scope.localizedDocuments[$scope.format][$scope.preferedLanguage], function(d){
						return d.url;
					}));

					if(urls.length==0) {
						return;
					}
					else {
						$http.post('/api/v2014/printsmart-downloads', urls).then(function(res){
							$scope.downloadLink = 'http://www.infra.cbd.int/api/v2014/printsmart-downloads/'+res.data._id;
						}).catch(function(err){
							console.log(err);
						});
					}
				}

				//==============================================
				//
				//
				//==============================================
				function documentsLocales(documents) {

					return _.uniq(_.flatten(_.map(documents, function(d){
						return _.union(_.keys(d.urls.pdf), _.keys(d.urls.doc));
					})))

				}

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
