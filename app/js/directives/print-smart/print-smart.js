define(['app', 'angular', 'bootstrap', './print-smart-document', './print-smart-checkout'], function(app, angular) {

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmart', ["$timeout", "$compile", '$q',  function($timeout, $compile, $q) {

		return {
			restrict : "AEC",
			scope : {

				canPrint : "@"
			},
			link : function($scope, element) {

				$("#t-header").css("z-index", "999"); // Fix header over dialog

				///////////////////////////////////////////////

				var checkoutDialog = angular.element("<div print-smart-checkout-dialog></div>");
				var downloadDialog = angular.element("<div print-smart-download-dialog></div>");
				var printDialog    = angular.element("<div print-smart-print-dialog></div>");

				element.append(checkoutDialog);
				element.append(downloadDialog);
				element.append(printDialog);

				checkoutDialog = $compile(checkoutDialog)($scope);
				downloadDialog = $compile(downloadDialog)($scope);
				printDialog    = $compile(printDialog   )($scope);

				//==============================================
				//
				//
				//==============================================
				$scope.showModal = function(target, visible) {

					if(target=='checkout') target = checkoutDialog;
					if(target=='download') target = downloadDialog;
					if(target=='print'   ) target = printDialog;

					if(!target && visible)
						return;

					if(target && target.is(':visible') == visible)
						return;

					var promises = [];

					if(checkoutDialog.is(':visible')) promises.push(showModalQ(checkoutDialog, false));
					if(downloadDialog.is(':visible')) promises.push(showModalQ(downloadDialog, false));
					if(printDialog   .is(':visible')) promises.push(showModalQ(printDialog,    false));

					return $q.all(promises).then(function(){

						if(target)
							return showModalQ(target, visible);
					});
				};

				//==============================================
				//
				//
				//==============================================
				function showModalQ(target, visible) {

					var defer = $q.defer();

					if(target.is(':visible') == visible) {
						$timeout(defer.resolve);
					}
					else {
						target.on('shown.bs.modal',  null, defer, eventResolver);
						target.on('hidden.bs.modal', null, defer, eventResolver);
						target.modal(visible ? 'show' : 'hide');
					}

					return defer.promise;
				}

				//==============================================
				//
				//
				//==============================================
				function eventResolver(evt) {

					angular.element(this).off('shown.bs.modal',  eventResolver);
					angular.element(this).off('hidden.bs.modal', eventResolver);
					$timeout(evt.data.resolve);
				}


				///////////////////////////////////////////////

				element.find(".printSmartVisible").fadeIn();
			},
			controller: ["$scope", function($scope) {

				var _self         = this;
				var documents     = [];
				var documentsMap  = {};
				var isHelpVisible = false;

				this.canPrint = function() {
					return $scope.canPrint!="false";
				};

				this.add = function(symbol, urls, tag) {

					var n = { symbol : symbol, urls : urls, tag : tag };
					var o = documentsMap[symbol];
					var i = documents.indexOf(o);

					if(i>=0)
						documents.splice(i, 1);

					documentsMap[symbol] = n;
					documents.push(n);
				};

				this.remove = function(symbol) {

					var o = documentsMap[symbol];
					var i = documents.indexOf(o);

					if(i>=0)
						documents.splice(i, 1);

					if(o!==undefined)
						delete documentsMap[symbol];
				};

				this.clear = function() {

					documentsMap = {};
					documents.splice(0, documents.length);
				};

				this.documents = function() {
					return documents;
				};

				this.hasDocument = function(symbol) {
					return !!documentsMap[symbol];
				};

				this.help = function(visible) {

					if(visible===undefined)
						return isHelpVisible;

					isHelpVisible = !!visible;

					return isHelpVisible;
				};

				this.open = function(target) {

					if(documents.length!==0) {
						     if(target=='checkout') $scope.showModal('checkout', true);
						else if(target=='download') $scope.showModal('download', true);
						else if(target=='print'   ) $scope.showModal('print',    true);
						else console.log('Unknown dialog',target);

					}
					else {
						_self.help(!_self.help());
					}
				};

				this.close = function() {
					return $scope.showModal(null, false);
				};

			}]
		};
	}]);

	console.log("PrintSmart app loaded");
});
