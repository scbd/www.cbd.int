import app from '~/app'
import html from './view-element.html'

	app.directive('info', [function() {
		return {
			restrict : "A",
			template : html,
			transclude: true,
			scope: {},
			link: function ($scope, element, atr) {

				$scope.showDecision = atr.showDecision
                $scope.info = element.data('info');

                if(!$scope.info)
                    return;

                if($scope.info.data && $scope.info.data.type=='information')
                    $scope.info.data.type = 'informational';

				if($scope.info.type=='paragraph') {
                    element.addClass('box');
				}


				//==============================
				//
				//==============================
				function romanize (n) {
					var roman = [ '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX' ];
					return roman[n];
				}
				$scope.romanize = romanize;
			}
		};
	}]);
