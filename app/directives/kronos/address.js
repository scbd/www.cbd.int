define(['app', 'text!./address.html'], function(app, html) { 'use strict';

	return app.directive('address', ['$http','$filter',function($http,$filter) {
		return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        type:'=',
        binding: "=ngModel",
      },
			link: function ($scope) {
        $http.get('/api/v2015/countries',{ cache: true })
          .then(function(o){return $filter('orderBy')(o.data, 'name.en');})
            .then(function(res){$scope.countries = res})

        $scope.$applyAsync(function(){
            $("[help]").tooltip();
        })
			}
		};
	}]);
});
