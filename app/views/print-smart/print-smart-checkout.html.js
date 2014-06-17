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
					if(psCtrl.getDocuments().length!==0)
						psCtrl.showPrint(psCtrl.getDocuments().length!==0);
					else 
						psCtrl.showHelp(true);
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
				scope.getDocuments = function() {  
					return psCtrl.getDocuments();
				};
			}
		};
	}]);
});