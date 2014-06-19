define(['angular'], function(angular) {
	return ["$scope", function ($scope) {

		angular.element("#badge").focus();
	
		$scope.$root.contact = null;
		$scope.$root.badge   = "";

	}];
});