
function PrintSmartCtrl($scope, $location, $timeout) {

	$scope.$watch(function() { return $location.path() }, function(path, oldPath){

		if(path == "/internal/printsmart") {
			$scope.badge = "";
			$scope.$root.contact = null;
		}
	});

    $scope.submit = function () {

    	if($scope.badge) {

    		var badge = $scope.badge=='boxes' ? "boxes" : (($scope.badge||"").replace(/[^0-9]/g, "") || "INVALID_BADGE_ID");

    	   	$location.path('/internal/printsmart/'+escape(badge));
    	}

    	$scope.badge = "";
    },

	$scope.close = function() {
		$location.hash('');
		$location.search({});
		$location.path("/internal/printsmart");
	};

	$scope.isHome = function () {
		return $location.path() == "/internal/printsmart";
	};

	$scope.formatBadge = function (code) {
		return (code||"").replace(/(.{4})(.+)/g, "$1-$2");
	};

	function keepBadgeFocus()
	{
		angular.element("#badge").focus();

		$scope.$root.keepBadgeFocusPromise = $timeout(keepBadgeFocus, 500);
	}

	if(!$scope.$root.keepBadgeFocusPromise)
		keepBadgeFocus();
}
