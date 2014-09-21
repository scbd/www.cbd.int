define(['app', 'directives/print-smart/print-smart', 'mobile/template-hacker'], function(app) {

	//==============================================
	//
	//
	//==============================================
	app.directive('inSessionDocuments', [function() {
		return {
			restrict : "AEC",
			replace : true,
			scope :  { },
			templateUrl : "/app/js/directives/meetings/documents/in-session.html",
			link: function ($scope, element, attrs) {

				$scope.allLanguages     = {  en : "English",  es : "Español", fr : "Français", ar : "العربية", ru : "Русский", zh : "中文" };
				$scope.documents = window[attrs.data || 'meetingDocuments'] || [];
				$scope.tag       = attrs.tag;
			}
		};
	}]);
});
