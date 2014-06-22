define(['app'], function(app) {

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

				$scope.valid = code && urls && urls.en;

				//========================================
				//
				//
				//========================================
				$scope.selected = function() {
					return psCtrl.hasDocument(code);
				}

				//========================================
				//
				//
				//========================================
				$scope.select = function(check) {

					if(check) psCtrl.add   (code, urls);
					else      psCtrl.remove(code);
				}

				//========================================
				//
				//
				//========================================
				$scope.help = function(o) {
					return psCtrl.help(o);
				}
			},
		};
	}]);
});