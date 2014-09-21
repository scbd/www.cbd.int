define(['app', 'bootstrap', './print-smart-document', './print-smart-checkout'], function(app) {

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmart', ["$timeout", "$compile", '$q',  function($timeout, $compile, $q) {

		return {
			restrict : "AEC",
			require : 'printSmart',
			scope : {},
			link : function($scope, element, attr, psCtrl) {

				$("#t-header").css("z-index", "999"); // Fix header over dialog

				///////////////////////////////////////////////

				var checkoutDialog = angular.element("<div print-smart-checkout-dialog></div>");
				var downloadDialog = angular.element("<div print-smart-download-dialog></div>");
				var printDialog    = angular.element("<div print-smart-print-dialog></div>");
				var documentsInfo  = angular.element('<div class="btn-group" style="position:fixed;top:5px;left:5px;" ng-show="documentCount()">'+
														'<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown">{{documentCount()}} document(s) <span class="caret"></span></button>'+
														'<ul class="dropdown-menu" role="menu">'+
															'<li><a style="cursor:pointer" ng-click="clear()">Clear selection</a></li>'+
														'</ul>'+
													 '</div>');

				element.append(checkoutDialog);
				element.append(downloadDialog);
				element.append(printDialog);
				element.append(documentsInfo);

				checkoutDialog = $compile(checkoutDialog)($scope);
				downloadDialog = $compile(downloadDialog)($scope);
				printDialog    = $compile(printDialog   )($scope);
				documentsInfo  = $compile(documentsInfo )($scope);

				$scope.documentCount = function() {
					return psCtrl.documents().length;
				};

				$scope.clear = function() {
					return psCtrl.clear();
				};

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
					$scope.showModal(null, false);
				};

			}]
		};
	}]);

	console.log("PrintSmart app loaded");
});
