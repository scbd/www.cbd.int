define(['app', 'directives/print-smart/print-smart'], function(app) {

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

				$scope.documents = window[attrs.data || 'meetingDocuments'] || [];
				$scope.tag       = attrs.tag;
			}
		};
	}]);
});
