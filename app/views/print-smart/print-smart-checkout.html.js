define(['app'], function(app) {

	app.directive('printSmartCheckout', ["$timeout", function($timeout) {
		return {
			restrict : "AEC",
			require: '^printSmart',
			replace : true,
			scope : {},
			templateUrl : "/app/views/print-smart/print-smart-checkout.html",
			link: function ($scope, element, attrs, psCtrl) {

				element.popover({ 
					delay : { show: 500, hide: 250 },
					trigger : 'manual'
				});

				var autoKillHelp = null;

				//==============================================
				//
				//
				//==============================================
				$scope.print = function() {  

					if(psCtrl.documents().length!==0)
						psCtrl.print(true);
					else 
						psCtrl.help(!psCtrl.help());
				};

				//==============================================
				//
				//
				//==============================================
				$scope.$watch( function() { return psCtrl.help() }, function(visible){

					if(autoKillHelp) {
						$timeout.cancel(autoKillHelp);
						autoKillHelp = null;
					}


					if(visible===false) element.popover('hide');
					if(visible===true) {

						element.popover('show');

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
			}
		};
	}]);
});