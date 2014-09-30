define(['angular'], function(angular) {
	return ["$scope",'$location',  function ($scope, $location) {

		angular.element("#authorization").focus();

		$scope.setAuthorization = function(){

			var cookie = 'machineAuthorization='+$scope.authorizationKey+';path=/;'
			var expiration = new Date();

			if($scope.authorizationKey) expiration.setMonth(expiration.getMonth()+2);
			else                        expiration.setMonth(expiration.getMonth()-2);

			cookie += 'expires='+expiration.toUTCString()+';';

			document.cookie = cookie;

			$scope.authorizationKey = '';


			$location.path('/printsmart');


		};

	}];
});
