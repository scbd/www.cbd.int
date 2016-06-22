define(['app', 'text!./view-element.html'], function(app, html) { 'use strict';

	return app.directive('info', [function() {
		return {
			restrict : "A",
			template : html,
			transclude: true,
			scope: {},
			link: function ($scope, element) {

                $scope.info = element.data('info');

                if(!$scope.info)
                    return;

                if($scope.info.data && $scope.info.data.type=='information')
                    $scope.info.data.type = 'informational';

				if($scope.info.type=='paragraph') {
                    element.addClass('box');
				}
			}
		};
	}]);
});
