define(['app', 'underscore', 'directives/print-smart/print-smart', 'mobile/template-hacker'], function(app, _) {

	//==============================================
	//
	//
	//==============================================
	app.directive('inSessionDocuments', [function() {
		return {
			restrict : "AEC",
			replace : true,
			require: '?^printSmart',
			scope :  {
				documentsFn : "&documents",
				tag : "@tag"
			},
			templateUrl : "/app/js/directives/meetings/documents/in-session.html",
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

					return d.urlPattern + locale + '.' + format;
				};
			}
		};
	}]);
});
