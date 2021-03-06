import app from '~/app';
import html from './address.html'; 

	export default app.directive('address', ['$http','$filter',function($http,$filter) {
		return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        type:'=',
        binding: "=ngModel",
        isSubmitted: "="
      },
			link: function ($scope) {
        $scope.$watch('isSubmitted',function(){
          $scope.addressEditForm.$submitted = $scope.isSubmitted
        })
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

