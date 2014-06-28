/* global -close */
// define(['app', 'angular', 'underscore', 'dropbox-dropins'], function(app, angular, _, Dropbox) {
define(['app', 'angular', 'underscore'], function(app, angular, _) {
   var Dropbox = undefined;

	app.directive('printSmartDialog', ["$http", "$timeout", "$cookies", function($http, $timeout, $cookies) {
		return {
			restrict : "AEC",
			require: '^printSmart',
			replace : true,
			scope :  {},
			templateUrl : "/app/views/print-smart/print-smart-dialog.html",
			link: function ($scope, element, attrs, psCtrl) {

				$scope.cleanBadge    = cleanBadge;
				$scope.clearError    = clearError;
				$scope.close         = close;
				$scope.selectedLinks = selectedLinks;
				$scope.isNetworkCall = false;

				var kiosk             = $cookies.kiosk!==undefined;
				var signedInToDropbox = false;

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

					signedInToDropbox = false;

					$scope.preferedLanguage = "en";
					$scope.badgeCode = "";
					$scope.error     = null;
					$scope.success   = null;
					$scope.target    = null;
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

					if($scope.canDropbox() && kiosk)
						signoutDropbox();
				});


				//==============================================
				//
				//
				//==============================================
				function initDownloadLink()	{

					$scope.success = null;
					$scope.downloadLink = null;

					var urls = selectedLinks();

					if(urls.length) {

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
				function selectedLinks() {

					if( $scope.target!='download') return [];
					if(!$scope.preferedLanguage)   return [];
					if(!$scope.format)             return [];

					return _.compact(_.map($scope.localizedDocuments[$scope.format][$scope.preferedLanguage], function(d){
						return d.url;
					}));
				}


				//==============================================
				//
				//
				//==============================================
				function documentsLocales(documents) {

					return _.uniq(_.flatten(_.map(documents, function(d){
						return _.union(_.keys(d.urls.pdf), _.keys(d.urls.doc));
					})));

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
				$scope.isMobileDevice = function() {
					return /mobile/i .test(navigator.userAgent) ||
						   /android/i.test(navigator.userAgent) ||
						   /tablet/i .test(navigator.userAgent) ||
						   /phone/i  .test(navigator.userAgent) ||
						   /RIM/     .test(navigator.userAgent);
				};

				//==============================================
				//
				//
				//==============================================
				$scope.canPrint = function() {
					return cleanBadge()   .length >= 8 &&
						   selectedLinks().length >  0;
				};

				//==============================================
				//
				//
				//==============================================
				$scope.canDownload = function() {
					return $scope.documents.length > 0;
				};

				//==============================================
				//
				//
				//==============================================
				$scope.canDropbox = function() {
					return $scope.canDownload() &&
						   Dropbox &&
						   Dropbox.isBrowserSupported();
				};

				//==============================================
				//
				//
				//==============================================
				$scope.sendToDropbox = function() {

					$scope.success = null;

					var files = _.map(selectedLinks(), function(url) {
						return { url : url };
					});

					if(!files.length)
						return;

					signedInToDropbox = true;

					var started = false;

					Dropbox.save({
					    files : files,
					    progress : function () {

							if(started)
								return;

							started = true;

							$scope.$apply(function() {
								$scope.success = 'dropbox';
							});
						},
					    error : function (errorMessage) {

							console.log('DROPBOX ERROR', errorMessage);

							$scope.$apply(function() {
								$scope.error = {
									error   : 'DROPBOX',
									message : errorMessage
								};
							});
						}
					});
				};

				//==============================================
				//
				//
				//==============================================
				function signoutDropbox() {

					console.log("signout from dropbox");
					angular.element('body').append('<iframe height="0" width="0" style="display:none" src="https://www.dropbox.com/logout"></iframe>');
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
				$scope.back = function() {

					$scope.error   = null;
					$scope.target  = null;
					$scope.success = null;
				};

				//==============================================
				//
				//
				//==============================================
				function close(clear) {

					if(kiosk && signedInToDropbox)
						signoutDropbox();

					if(!!clear)
						psCtrl.clear();

					psCtrl.print(false);
				}
			}
		};
	}]);
});
