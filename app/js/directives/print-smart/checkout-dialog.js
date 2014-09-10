/* global -close */
define(['app'], function(app, angular, _, Dropbox) {

	app.directive('printSmartCheckoutDialog', ["$http", function($http) {
		return {
			restrict : "AEC",
			require: '?^printSmart',
			replace : true,
			scope :  {},
			templateUrl : "/app/js/directives/print-smart/checkout-dialog.html",
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
				$scope.close = function() {
					psCtrl.close();
				};
			}
		};
	}]);
});
