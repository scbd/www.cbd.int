define(['app', 'text!./print-smart-checkout.html', './checkout-dialog', './print-dialog', './download-dialog'], function(app, templateHtml) {

	app.directive('printSmartCheckout', ["$timeout", function($timeout) {
		return {
			restrict : "AEC",
			require: '?^printSmart',
			replace : true,
			priority: 1000,
			scope : {},
			template : templateHtml,
			link: function ($scope, element, attrs, psCtrl) {

				$scope.disabled = !psCtrl;  //optional directive is disabled if no controller

				if(!psCtrl)	return;

				///////////////////////////////////////////////

				var popover = element.find('#checkout');

				popover.popover({
					delay : { show: 500, hide: 250 },
					trigger : 'manual',
					placement : function() {
						return element.css('position') == 'fixed' ? 'bottom' : 'top';
					}
				});

				if(element.hasClass('fixed-top-right')) {

					element.removeClass("fixed-top-right");

					var pos = element.position();

					$(window).scroll(function() {

				        var windowpos = $(window).scrollTop();

				        if (windowpos >= pos.top) {
				            element.addClass("fixed-top-right");
				        } else {
				            element.removeClass("fixed-top-right");
				        }

						if(!windowpos)
							pos = element.position();
				    });
				}


				var autoKillHelp = null;

				//==============================================
				//
				//
				//==============================================
				$scope.$watch( function() { return psCtrl.help(); }, function(visible){

					if(autoKillHelp) {
						$timeout.cancel(autoKillHelp);
						autoKillHelp = null;
					}


					if(visible===false) popover.popover('hide');
					if(visible===true) {

						popover.popover('show');

						autoKillHelp = $timeout(function() {
							autoKillHelp = null;
							psCtrl.help(false);
						}, 3000);

					}
				});

				//==============================================
				//
				//
				//==============================================
				$scope.documents = function() {
					return psCtrl.documents();
				};

				//==============================================
				//
				//
				//==============================================
				$scope.clear = function() {
					return psCtrl.clear();
				};

				//==============================================
				//
				//
				//==============================================
				$scope.remove = function(symbol) {
					return psCtrl.remove(symbol);
				};

				//==============================================
				//
				//
				//==============================================
				$scope.checkout = function() {
					psCtrl.open('checkout');
				};

				//==============================================
				//
				//
				//==============================================
				$scope.print = function() {
					psCtrl.open('print');
				};

				//==============================================
				//
				//
				//==============================================
				$scope.download = function() {
					psCtrl.open('download');
				};

				//==============================================
				//
				//
				//==============================================
				$scope.canPrint = function() {
					return psCtrl.canPrint();
				};
			}
		};
	}]);
});
