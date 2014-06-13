define(['app'], function(app) {

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmart', ["$compile", function($compile) {
		return {
			restrict : "AE",
			scope : {},
			link : function(scope, element) {

				console.log(scope);

				var dialog = angular.element("<div print-smart-dialog></div>");

				element.prepend(dialog);

				$compile(dialog)(scope);

			},
			controller: ["$scope", function() {

				var documents    = [];
				var documentsMap = {};
				var printDialogVisible = false;

				this.addDocument = function(code, url) {

					console.log("add", code);

					var n = { DocumentSymbol : code, DocumentUrl : url };
					var o = documentsMap[code];
					var i = documents.indexOf(o);

					if(i>=0)
						documents.splice(i, 1);

					documentsMap[code] = n;
					documents.push(n);
				};

				this.removeDocument = function(code) {

					console.log("del", code);

					var o = documentsMap[code];
					var i = documents.indexOf(o);

					if(i>=0)
						documents.splice(i, 1);

					if(o!==undefined)
						delete documentsMap[code];
				};

				this.clearDocuments = function() {

					documentsMap = {};
					documents.splice(0, documents.length);
				};

				this.getDocuments = function() {
					return documents;
				};

				this.hasDocument = function(code) {
					return !!documentsMap[code];
				};

				this.showPrintDialog = function(visible) {
					printDialogVisible = visible;
				};

				this.isPrintDialogVisible = function() {
					return printDialogVisible;
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

				var re    = /(http[s]?:\/\/[a-z\.]+\/)(.*)([a-z]{2})(.pdf)/gi;
				var host  = attrs.documentUrl.replace(re, "$1");
				var ext   = attrs.documentUrl.replace(re, "$4");
				var path  = attrs.documentUrl.replace(re, "$2");
				var paths = { 
					ar : '/'+path+'ar'+ext,
					es : '/'+path+'es'+ext,
					fr : '/'+path+'fr'+ext,
					ru : '/'+path+'ru'+ext,
					zh : '/'+path+'zh'+ext
				};

				var code = attrs.documentCode;
				var urls = { en : attrs.documentUrl };
				var qPS  = element.parents("div[print-smart]:first");

				if(qPS.find('a[href="'+paths.ar+'"]').size()!==0) urls.ar = host+paths.ar;
				if(qPS.find('a[href="'+paths.es+'"]').size()!==0) urls.es = host+paths.es;
				if(qPS.find('a[href="'+paths.fr+'"]').size()!==0) urls.fr = host+paths.fr;
				if(qPS.find('a[href="'+paths.ru+'"]').size()!==0) urls.ru = host+paths.ru;
				if(qPS.find('a[href="'+paths.zh+'"]').size()!==0) urls.zh = host+paths.zh;

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


	//==============================================
	//
	//
	//==============================================
	app.directive('printSmartCheckout', ["$timeout", function($timeout) {
		return {
			restrict : "C",
			require: '^printSmart',
			link: function (scope, element, attrs, psCtrl) {

				scope.$watch(function() {  return psCtrl.getDocuments().length;  }, function(count) {

					element.prop("disabled", !count);
				});

				element.bind("click", function() {
					$timeout(function() { 
						psCtrl.showPrintDialog(psCtrl.getDocuments().length===0);
					});
				});
			}
		};
	}]);

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmartDialog', function() {
		return {
			restrict : "AC",
			require: '^printSmart',
			replace : true,
			scope :  {},
			templateUrl : "/app/views/print-smart/print-smart-dialog.html",
			link: function (scope, element, attrs, psCtrl) {

				scope.documents = psCtrl.getDocuments();
				scope.preferedLanguage = "en";

				scope.languages = [
				{ code : "ar", name : "العربية" },
				{ code : "en", name : "English" },
				{ code : "es", name : "Español" },
				{ code : "fr", name : "Français" },
				{ code : "ru", name : "Русский" },
				{ code : "zh", name : "中文" },
				];

				scope.print = function() {
					alert("printed!");
					psCtrl.clearDocuments();
				};
			}
		};
	});

	console.log("Print smart app loaded");
});