define(['app', 'bootstrap', './print-smart-checkout', './print-smart-document', './print-smart-dialog'], function(app) {

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmart', ["$compile", function($compile) {

		return {
			restrict : "AEC",
			scope : {},
			link : function(scope, element) {

				$("#t-header").css("z-index", "999"); // Fix header over dialog

				var printDialog = angular.element("<div print-smart-dialog></div>");

				element.prepend(printDialog);

				scope.__printDialog = $compile(printDialog)(scope);

				element.find(".printSmartVisible").fadeIn();

			},
			controller: ["$scope", function($scope) {

				var documents     = [];
				var documentsMap  = {};
				var isHelpVisible = false;

				this.add = function(symbol, urls) {

					var n = { symbol : symbol, urls : urls };
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

				this.print = function(visible) {

					if(visible===undefined)
						return $scope.__printDialog.is(":visible");

					if($scope.__printDialog.is(":visible")===visible)
						return;

					$scope.__printDialog.modal(!!visible ? "show" : "hide");
				};

				this.help = function(visible) {

					if(visible===undefined)
						return isHelpVisible;

					isHelpVisible = !!visible;

					return isHelpVisible;
				};
			}]
		};
	}]);

	console.log("PrintSmart app loaded");
});
