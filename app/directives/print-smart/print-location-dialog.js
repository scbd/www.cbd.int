import 'css!./location-button.css'
import locations from './locations'

export { default as template } from './print-location-dialog.html';

export default ["$scope", "$cookies", function ($scope, $cookies) {

		$scope.locations = locations;

		$scope.back  = function() { $scope.closeThisDialog({ action: 'checkout' }); };
		$scope.print = function() { $scope.closeThisDialog({ action: 'print', location: $scope.selectedLocation });    };
		$scope.close = function() { $scope.closeThisDialog(); };

		$scope.selectedLocation = loadPref().location

		$scope.selectLocation = function(location) { 

			if($scope.selectedLocation == location)
				return $scope.print();

			$scope.selectedLocation = location;
		};

		//==============================================
		//
		//
		//==============================================
		function loadPref() {
			try {
				return JSON.parse($cookies.get("printSmartPref")||'{}')
			}
			catch(e){
				return {};
			}
		}
	}];