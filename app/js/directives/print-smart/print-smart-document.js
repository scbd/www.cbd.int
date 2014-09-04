define(['app', 'underscore'], function(app, _) {

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmartDocument', [function() {
		return {
			restrict : "AEC",
			require: '?^printSmart',
			replace : true,
			priority: 10,
			scope :  {
				documentUrl : "@",
				documentCode : "@",
			 },
			templateUrl : "/app/js/directives/print-smart/print-smart-document.html",
			link: function ($scope, element, attrs, psCtrl) {
				$scope.element  =  element;
				$scope.psCtrl   =  psCtrl;
				$scope.disabled = !psCtrl;  //optional directive is disabled if no controller
			},
			controller : ["$scope", function($scope) {

				//========================================
				// INIT
				//
				//========================================

				$scope.$watch('documentCode', init);
				$scope.$watch('documentUrl',  init);

				var code = null;
				var pdfs = null;
				var docs = null;

				function init() {

					if(!$scope.documentCode && !$scope.documentUrl)
						return;

					code = $scope.documentCode;
					pdfs = loadLocalizedLinks($scope.documentUrl, ".pdf");
					docs = _.extend(loadLocalizedLinks($scope.documentUrl, ".doc"),
									    loadLocalizedLinks($scope.documentUrl, ".docx"));

					if(!pdfs.en && /.pdf$/i .test($scope.documentUrl)) pdfs.en = $scope.documentUrl;
					if(!docs.en && /.doc$/i .test($scope.documentUrl)) docs.en = $scope.documentUrl;
					if(!docs.en && /.docx$/i.test($scope.documentUrl)) docs.en = $scope.documentUrl;


					$scope.valid = code && pdfs.en || docs.en;
				}

				//========================================
				//
				//
				//========================================
				$scope.selected = function() {
					return $scope.psCtrl && $scope.psCtrl.hasDocument(code);
				};

				//========================================
				//
				//
				//========================================
				$scope.select = function(check) {

					if(check)
						init();

					if(check) $scope.psCtrl.add   (code, { pdf: pdfs, doc : docs });
					else      $scope.psCtrl.remove(code);
				};

				//========================================
				//
				//
				//========================================
				$scope.help = function(o) {
					return $scope.psCtrl && $scope.psCtrl.help(o);
				};

				//========================================
				//
				//
				//========================================
				function loadLocalizedLinks(documentUrl, extension)
				{
					var urls = { };

					try
					{
						var qPS   = $scope.element.parents("div[print-smart]:first");
						var re    = /(http[s]?:\/\/[a-z\.]+\/)(.*)([a-z]{2})(.\w+)/i;
						var host  = documentUrl.replace(re, "$1").replace(/\/$/, "");
						//var ext   = documentUrl.replace(re, "$4");
						var path  = '/'+documentUrl.replace(re, "$2");
						var paths = {
							ar : path+'ar'+extension,
							en : path+'en'+extension,
							es : path+'es'+extension,
							fr : path+'fr'+extension,
							ru : path+'ru'+extension,
							zh : path+'zh'+extension
						};

						if(qPS.find('a[href="'+paths.ar+'"]').size()!==0) urls.ar = host+paths.ar;
						if(qPS.find('a[href="'+paths.en+'"]').size()!==0) urls.en = host+paths.en;
						if(qPS.find('a[href="'+paths.es+'"]').size()!==0) urls.es = host+paths.es;
						if(qPS.find('a[href="'+paths.fr+'"]').size()!==0) urls.fr = host+paths.fr;
						if(qPS.find('a[href="'+paths.ru+'"]').size()!==0) urls.ru = host+paths.ru;
						if(qPS.find('a[href="'+paths.zh+'"]').size()!==0) urls.zh = host+paths.zh;
					}
					catch(e)
					{
						console.log("Error looking for other language of : %s for extension: %s", documentUrl, extension);
					}

					return urls;
				}
			}]
		};
	}]);
});
