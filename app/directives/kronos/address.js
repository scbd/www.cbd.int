import app from '~/app';
import html from './address.html';
import participationT from '~/i18n/participation/index.js';

	export default app.directive('address', ['$http','$filter','translationService','locale',function($http,$filter, $i18n, locale) {
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
        $i18n.set('participationT', participationT );
        
        $scope.$watch('isSubmitted',function(){
          $scope.addressEditForm.$submitted = $scope.isSubmitted
        })
        var params = {
                        s:{[`name.${locale}`]:1},
                        f:{name:1,code:1}
                      }

        $http.get('/api/v2015/countries',{ params : params },{ cache: true })
            .then(function(res){ return res.data})
                      .then(localizeCountry)

            function localizeCountry(data){
              for (const c of data)
                c.title = c.name[locale]

              $scope.countries = data

              return data
            }
        $scope.$applyAsync(function(){
            $("[help]").tooltip();
        })
			}
		};
	}]);

