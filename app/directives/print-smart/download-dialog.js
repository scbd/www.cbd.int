/* global -close */
define(['app', 'text!./download-dialog.html', 'angular', 'underscore', 'dropbox-dropins'], function(app, templateHtml, angular, _, Dropbox) {

	app.directive('printSmartDownloadDialog', ["$http", function($http) {
		return {
			restrict : "AEC",
			require: '?^printSmart',
			replace : true,
			scope :  {},
			template : templateHtml,
			link: function ($scope, element, attrs, psCtrl) {

				$scope.disabled = !psCtrl;  //optional directive is disabled if no controller

				if(!psCtrl)	return;

				///////////////////////////////////////////////

				var publicComputer    = true; // TODO
				var signedInToDropbox = false;

				$scope.clearError       = clearError;
				$scope.close            = close;
				$scope.loading          = false;
				$scope.allLanguages     = {  en : "English",  es : "Español", fr : "Français", ar : "العربية", ru : "Русский", zh : "中文" };
				$scope.allFormats       = { doc : "MS Word", pdf : "PDF" };
				$scope.documentLocales  = [];
				$scope.documentFormats  = [];
				$scope.locales          = {};
				$scope.formats          = {};

				$scope.$watch('formats', initDownloadLink, true);
				$scope.$watch('locales', initDownloadLink, true);

				element.on("show.bs.modal", function() {
					$scope.error     = null;
					$scope.success   = null;
					$scope.documents = psCtrl.documents();
					$scope.documentLocales = getDocumentLocales();
					$scope.documentFormats = getDocumentFormats();
					$scope.locales  = {};
					$scope.formats  = {};
					$scope.downloadLink = null;

					if($scope.documentLocales.length==1)
						$scope.locales[$scope.documentLocales[0]] = true;

					if($scope.documentFormats.length==1)
						$scope.formats[$scope.documentFormats[0]] = true;

					signedInToDropbox = false;

					if($scope.canDropbox() && publicComputer)
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
							$scope.downloadLink = '/api/v2014/printsmart-downloads/'+res.data._id;
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

					var urls = [];

					_.each($scope.documents, function(doc) {

						_.each($scope.formats, function(active, format) {

							if(!active)           return;
							if(!doc.urls[format]) return;

							_.each($scope.locales, function(active, locale) {

								if(!active) return;

								urls.push(doc.urls[format][locale] || doc.urls[format].en);
							});
						});
					});

					return _.chain(urls).uniq().compact().value();
				}


				//==============================================
				//
				//
				//==============================================
				function getDocumentLocales() {

					var locales = _($scope.documents).map(function(doc){
						return _.union(_.keys(doc.urls.pdf), _.keys(doc.urls.doc));
					});

					return _.chain(locales).flatten().uniq().sortBy(_.identity).value();
				}

				//==============================================
				//
				//
				//==============================================
				function getDocumentFormats() {

					var formats = _($scope.documents).map(function(doc){
						return _.map(doc.urls, function(value, format){
							return _.isEmpty(value) ? undefined : format;
						});
					});

					return _.chain(formats).flatten().uniq().compact().sortBy(_.identity).value();
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
				$scope.canDownload = function() {
					return $scope.documents.length > 0;
				};

				//==============================================
				//
				//
				//==============================================
				$scope.canDropbox = function() {
					return Dropbox &&
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
				$scope.isCustomError = function() {

					if(!$scope.error)
						return false;

					return $scope.error.error!=="NO_SERVICE";
				};

				//==============================================
				//
				//
				//==============================================
				$scope.back = function() {

					$scope.error   = null;
					$scope.success = null;

					psCtrl.open('checkout');
				};

				//==============================================
				//
				//
				//==============================================
				function close(clear) {

					if(signedInToDropbox && publicComputer)
						signoutDropbox();

					if(!!clear)
						psCtrl.clear();

					psCtrl.close();
				}
			}
		};
	}]);
});
