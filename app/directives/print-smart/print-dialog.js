/* global -close */
define(['app', 'text!./print-dialog.html','angular', 'underscore', 'ngCookies'], function(app, templateHtml, angular, _) {

	app.directive('printSmartPrintDialog', ["$http", "$location", "$cookies", function($http, $location, $cookies) {
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

				var allLanguages = {
					ar : "العربية",
					en : "English",
					es : "Español",
					fr : "Français",
					ru : "Русский",
					zh : "中文"
				};

				$scope.cleanBadge = cleanBadge;
				$scope.clearError = clearError;
				$scope.close      = close;
				$scope.loading    = false;
				$scope.allLanguages    = allLanguages;
				$scope.documentLocales = [];
				$scope.locales         = {};

				element.on("show.bs.modal", function() {
                    $scope.badgeCode = "";
					$scope.badgeCode = cleanBadge($scope.$root.badgeCode || "");
					$scope.error     = null;
					$scope.success   = null;
					$scope.documents = psCtrl.documents();
					$scope.documentLocales = getDocumentLocales();
					$scope.locales   = {};

					if($scope.documentLocales.length==1)
						$scope.locales[$scope.documentLocales[0]] = true;
				});

				//==============================================
				//
				//
				//==============================================
				function cleanBadge(code) {
					return (code||$scope.badgeCode||"").replace(/[^0-9]/g, "");
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
					return cleanBadge().length >= 8 && _.compact(_.values($scope.locales)).length>0;
				};

				//==============================================
				//
				//
				//==============================================
				$scope.canPrintShop = function() {
					return !!$cookies.machineAuthorization && _.compact(_.values($scope.locales)).length>0;
				};

				//==============================================
				//
				//
				//==============================================
				$scope.hasPrintShop = function() {
					return !!$cookies.machineAuthorization;
				};

				//==============================================
				//
				//
				//==============================================
				function getDocumentLocales() {

					var locales = _($scope.documents).map(function(doc){
						return _.keys(doc.urls.pdf);
					});

					return _.chain(locales).flatten().uniq().sortBy(_.identity).value();
				}

				//==============================================
				//
				//
				//==============================================
				function documentsToPrint() {

					var documents = [];

					_.each($scope.documents, function(doc) {

						_.each($scope.locales, function(active, locale) {

							if(!active) return;

							documents.push({
								symbol  : doc.symbol,
								tag     : doc.tag,
								url     : doc.urls.pdf[locale] || doc.urls.pdf.en,
								language: doc.urls.pdf[locale] ?  locale : 'en'
							});
						});
					});

					documents = _.uniq(documents, function(doc){
						return doc.url;
					});

					return documents;

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
						documents : documentsToPrint()
					};

					$scope.loading = true;

					$http.post("/api/v2014/printsmart-requests/batch", postData).success(function(data) {

						$scope.loading = false;
						$scope.success       = angular.isObject(data) ? data : {};

					}).error(function(data, status){

						$scope.loading = false;

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
				$scope.printShop = function() {

					$scope.error = null;
					$scope.success = null;

					$scope.$root.printShop = {
						badge     : cleanBadge(),
						documents : documentsToPrint()
					};

					close().then(function(){
						$location.url('/printshop');
					});
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

					if(!!clear)
						psCtrl.clear();

					return psCtrl.close();
				}
			}
		};
	}]);
});
