define(['app', 'data/bbi/links', 'directives/bbi/bbi-project-row','directives/bbi/menu'], function(app,links) { 'use strict';

return ['$location','$scope','$http', function ($location,$scope,$http) {

			var _ctrl = this;
			_ctrl.links=links.links;
      _ctrl.projects=[];
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "Selected Projects: Bio Bridge Initiative";

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
        function getProjects () {
              return _ctrl.projects
        }
        $scope.getProjects = getProjects;

        //=======================================================================
        //
        //=======================================================================
        function query() {

            _ctrl.loading         = true;

           return $http.get('/api/v2018/projects')
              .then(function (data) {
                data=data.data;
                _ctrl.projects=data;
                _ctrl.count = data.length;
            }).catch(function(error) {
                console.log('ERROR: ' + error);
            })
            .finally(function(){
              _ctrl.loading = false;
            });

        }// query
        query()
    }];
});
