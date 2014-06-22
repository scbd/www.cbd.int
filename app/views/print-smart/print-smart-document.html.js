define(['app', 'underscore'], function(app, _) {

	//==============================================
	//
	//
	//==============================================
	app.directive('printSmartDocument', [function() {
		return {
			restrict : "AEC",
			require: '^printSmart',
			replace : true,
			scope :  { },
			templateUrl : "/app/views/print-smart/print-smart-document.html",
			link: function ($scope, element, attrs, psCtrl) {

				//========================================
				// INIT
				//
				//========================================

				var code = attrs.documentCode;
				var pdfs = loadLocalizedLinks(attrs.documentUrl, ".pdf");
				var docs = _.extend(loadLocalizedLinks(attrs.documentUrl, ".doc"), 
								    loadLocalizedLinks(attrs.documentUrl, ".docx"));

				if(!pdfs.en && /.pdf$/i .test(attrs.documentUrl)) pdfs.en = attrs.documentUrl;
				if(!docs.en && /.doc$/i .test(attrs.documentUrl)) docs.en = attrs.documentUrl;
				if(!docs.en && /.docx$/i.test(attrs.documentUrl)) docs.en = attrs.documentUrl;


				$scope.valid = code && pdfs.en || docs.en;

				//========================================
				//
				//
				//========================================
				$scope.selected = function() {
					return psCtrl.hasDocument(code);
				};

				//========================================
				//
				//
				//========================================
				$scope.select = function(check) {

					if(check) psCtrl.add   (code, { pdf: pdfs, doc : docs });
					else      psCtrl.remove(code);
				};

				//========================================
				//
				//
				//========================================
				$scope.help = function(o) {
					return psCtrl.help(o);
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
						var qPS   = element.parents("div[print-smart]:first");
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
			},
		};
	}]);
});