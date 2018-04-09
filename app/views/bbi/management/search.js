define(['app', 'lodash','data/bbi/links-platform', 'directives/bbi/menu','directives/bbi/search/search'], function(app, _,links) { 'use strict';

	return ['$location','$route','$scope','user', function ($location,$route,$scope,user) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
        _ctrl.user = {};
  
				_ctrl.schema = _.camelCase($route.current.params.schema);
				init();
				$scope.$root.page={};
        $scope.$root.page.title = "Search: BBI Web Platform";
				//============================================================
				//
				//============================================================
				function init () {
								setSchema();
				}
				//============================================================
				//
				//============================================================
				function setSchema (url) {
								if(_ctrl.schema){
									$location.replace();
									$location.search("schema_s",_ctrl.schema);
								}
				}
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
});
