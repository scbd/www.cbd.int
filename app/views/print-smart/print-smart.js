define(['app', 'bootstrap', 'print-smart-checkout.html', 'print-smart-dialog.html', 'print-smart-help.html'], function(app) {

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmart', ["$compile", function($compile) {

		return {
			restrict : "AE",
			scope : {},
			link : function(scope, element) {

				$("#t-header").css("z-index", "999"); // Fix header over dialog

				var printDialog = angular.element("<div print-smart-dialog></div>");
				var helpDialog  = angular.element("<div print-smart-help></div>");

				element.prepend(printDialog);
				element.prepend(helpDialog);

				scope.__printDialog = $compile(printDialog)(scope);
				scope.__helpDialog  = $compile(helpDialog )(scope);

				element.find(".printSmartVisible").fadeIn();

			},
			controller: ["$scope", function($scope) {

				var documents    = [];
				var documentsMap = {};

				this.addDocument = function(symbol, urls) {

					var n = { symbol : symbol, urls : urls };
					var o = documentsMap[symbol];
					var i = documents.indexOf(o);

					if(i>=0)
						documents.splice(i, 1);

					documentsMap[symbol] = n;
					documents.push(n);
				};

				this.removeDocument = function(symbol) {

					var o = documentsMap[symbol];
					var i = documents.indexOf(o);

					if(i>=0)
						documents.splice(i, 1);

					if(o!==undefined)
						delete documentsMap[symbol];
				};

				this.clearDocuments = function() {

					documentsMap = {};
					documents.splice(0, documents.length);
				};

				this.getDocuments = function() {
					return documents;
				};

				this.hasDocument = function(symbol) {
					return !!documentsMap[symbol];
				};

				this.showPrint = function(visible) {

					if($scope.__printDialog.is(":visible")===visible)
						return;

					$scope.__printDialog.modal(!!visible ? "show" : "hide");
				};

				this.showHelp = function(visible) {

					if($scope.__helpDialog.is(":visible")===visible)
						return;

					$scope.__helpDialog.modal(!!visible ? "show" : "hide");
				};
			}]
		};
	}]);


	//==============================================
	//
	//
	//==============================================
	app.directive('printSmartDocument', ["$timeout", function($timeout) {
		return {
			restrict : "C",
			require: '^printSmart',
			link: function (scope, element, attrs, psCtrl) {

				var code = attrs.documentCode;
				var urls = { en : attrs.documentUrl };

				try
				{
					var qPS   = element.parents("div[print-smart]:first");
					var re    = /(http[s]?:\/\/[a-z\.]+\/)(.*)([a-z]{2})(.pdf)/i;
					var host  = attrs.documentUrl.replace(re, "$1").replace(/\/$/, "");
					var ext   = attrs.documentUrl.replace(re, "$4");
					var path  = '/'+attrs.documentUrl.replace(re, "$2");
					var paths = { 
						ar : path+'ar'+ext,
						es : path+'es'+ext,
						fr : path+'fr'+ext,
						ru : path+'ru'+ext,
						zh : path+'zh'+ext
					};
					
					if(qPS.find('a[href="'+paths.ar+'"]').size()!==0) urls.ar = host+paths.ar;
					if(qPS.find('a[href="'+paths.es+'"]').size()!==0) urls.es = host+paths.es;
					if(qPS.find('a[href="'+paths.fr+'"]').size()!==0) urls.fr = host+paths.fr;
					if(qPS.find('a[href="'+paths.ru+'"]').size()!==0) urls.ru = host+paths.ru;
					if(qPS.find('a[href="'+paths.zh+'"]').size()!==0) urls.zh = host+paths.zh;
				}
				catch(e)
				{
					console.log("Error looking for other language of :", attrs.documentUrl);
				}

				scope.$watch(function() { return psCtrl.getDocuments().length;  }, function() {

					element.prop('checked', psCtrl.hasDocument(code));
				});

				element.bind("click", function() {

					var checked = this.checked;
					
					$timeout(function() { //force apply

						if(checked) psCtrl.addDocument   (code, urls);
						else        psCtrl.removeDocument(code);
					});
				});
			}
		};
	}]);

	console.log("PrintSmart app loaded");
});