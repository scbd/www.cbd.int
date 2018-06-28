define(['app', 'text!./participant.html','./address'], function(app, html) { 'use strict';

	return app.directive('participant', ['$http',function($http) {
		return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        type:'=',
        binding: "=ngModel",
        showContact: "=showContact"
      },
			link: function ($scope ) {

        initDoc()
        function initDoc(){
          if(!$scope.binding) $scope.doc ={}
          $scope.doc.useOrganizationAddress = true
          $scope.doc.address = {}
        }
        $scope.initDoc =initDoc
        $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms',{ cache: true })
            .then(function(res){$scope.languages = res.data})

        $scope.$applyAsync(function(){
            $("[help]").tooltip();
        })
			}
		};
	}]);
});
