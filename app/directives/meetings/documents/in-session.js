define(['app', 'underscore', 'text!./in-session.html', 'directives/print-smart/print-smart'], function(app, _, templateHtml) {

	//==============================================
	//
	//
	//==============================================
	app.directive('inSessionDocuments', ["$http", function($http) {
		return {
			restrict : "E",
			replace : true,
			template : templateHtml,
			require: '?^printSmart',
			scope :  {
				documentsFn : "&documents",
				tag : "@tag"
			},
			link: function ($scope, element, attrs, psCtrl) {

				$scope.allLanguages = {  en : "English",  es : "Español", fr : "Français", ar : "العربية", ru : "Русский", zh : "中文" };

				//==============================================
				//
				//
				//==============================================
				$scope.documents = function(){
					return $scope.documentsFn() || window[attrs.data];
				};

				//==============================================
				//
				//
				//==============================================
				$scope.breakable = function(text) {
					return (text||"").replace(/\//g, '/\u200b');
				};

				//==============================================
				//
				//
				//==============================================
				$scope.selected = function(symbol) {
					return psCtrl && psCtrl.hasDocument(symbol);
				};

				//==============================================
				//
				//
				//==============================================
				$scope.hasFormat = function(d, format) {
					return !d.formats || _.contains(d.formats, format);
				};

				//==============================================
				//
				//
				//==============================================
				$scope.getUrl = function(d, locale, format) {

					if(!$scope.hasFormat(d, format))
						return "";

					return d.path +'/'+ d.filePattern + '-' + locale + '.' + format;
				};
				//==============================================
				//
				//
				//==============================================
				$scope.hit = function(d, locale, format) {

					var url = $scope.getUrl(d, locale, format);

					if(!url) return;
					if( url.indexOf('/')===0) url = 'http://www.cbd.int/' + url.replace(/^\/+/g, "");

					$http.post("/api/v2014/printsmart-downloads/hit", [url]);
				};
			}
		};
	}]);
});
