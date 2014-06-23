define(['app', 'underscore'], function(app, _) {

	//==============================================
	//
	//
	//==============================================
	app.directive('meetingDocuments', [function() {
		return {
			restrict : "AEC",
			replace : true,
			scope :  { },
			templateUrl : "/app/views/print-smart/meeting-documents.html",
			link: function ($scope, element, attrs, psCtrl) {
debugger;
				$scope.documents = window[attrs.data || 'meetingDocuments'] || [];
			}
		};
	}]);
});