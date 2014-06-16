define(['app'], function(app) {

	app.directive('printSmartCheckout', [function() {
		return {
			restrict : "C",
			require: '^printSmart',
			replace : true,
			scope : {},
			templateUrl : "/app/views/print-smart/print-smart-checkout.html",
			link: function (scope, element, attrs, psCtrl) {

				//==============================================
				//
				//
				//==============================================
				scope.print = function() {  
					psCtrl.showPrint(psCtrl.getDocuments().length!==0);
				};

				//==============================================
				//
				//
				//==============================================
				scope.help = function() {  
					psCtrl.showHelp(true);
				};

				//==============================================
				//
				//
				//==============================================
				scope.isDisabled = function() {  
					return psCtrl.getDocuments().length===0;  
				};
			}
		};
	}]);
});