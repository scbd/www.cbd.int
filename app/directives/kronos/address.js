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
        var params = {
                        s:{'name.en':1},
                        f:{'name.en':1,code:1}
                      }

        $http.get('/api/v2015/countries',{ params : params },{ cache: true })
            .then(function(res){$scope.countries = res.data})

        $scope.$applyAsync(function(){
            $("[help]").tooltip();
        })
			}
		};
	}]);
});
