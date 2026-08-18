import $ from 'jquery'

import './directives/notification'
import './directives/meeting-document'
import './directives/meeting'
import referenceType from '~/util/reference-type'

export { default as template } from './select-outcome-dialog.html'

export default ['$scope', '$timeout', function ($scope, $timeout) {

        $timeout(function(){ $('form #symbol').focus(); }, 100);

        $scope.save = save;

        $scope.$watch('symbol', onChangeSymbol);

		//==========================
		//
		//==========================
        function onChangeSymbol(text) {

            var symbol = (text||'').trim();

            $scope.type = symbol ? referenceType(symbol) : null;
            $scope.code = $scope.type=='url' ? symbol : symbol.toUpperCase();
        }

		//==========================
		//
		//==========================
        function save() {

            if(!$scope.code)
                return;

            $scope.closeThisDialog($scope.code);
        }
	}];
