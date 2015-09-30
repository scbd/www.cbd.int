/* global -close */
define(['app', 'text!./checkout-dialog.html'], function(app, templateHtml) {

	app.directive('printSmartCheckoutDialog', [function() {
		return {
			restrict : "AEC",
			require: '?^printSmart',
			replace : true,
			scope :  {},
			template : templateHtml,
			link: function ($scope, element, attrs, psCtrl) {

				$scope.disabled = !psCtrl;  //optional directive is disabled if no controller

				if(!psCtrl)	return;

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
				$scope.download = function() {
					psCtrl.open('download');
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
				$scope.canPrint = function() {
					return psCtrl.canPrint();
				};

				//==============================================
				//
				//
				//==============================================
				$scope.close = function() {
					psCtrl.close();
				};
			}
		};
	}]);
});
