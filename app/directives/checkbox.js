import app from '~/app';
import html from './checkbox.html'; 

	export default app.directive('checkbox', [function() {
		return {
            require: 'ngModel',
			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			link: function ($scope, x, y, ngModel) {

                $scope.check = function(checked, $event) {
                    ngModel.$setViewValue(checked);

                    if($event) {
                        $event.stopPropagation();
                    }
                };

                $scope.checked = function() {
                    return ngModel.$modelValue;
                };
			}
		};
	}]);

