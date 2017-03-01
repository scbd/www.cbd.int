define(['app', 'lodash','data/bbi/links-platform', 'directives/bbi/crumbs', 'directives/bbi/menu'], function(app, _,links) { 'use strict';

	return ['$location','$scope','user', function ($location,$scope,user) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
				_ctrl.user=user;
				$scope.$root.page={};
				$scope.$root.page.title = "BBI Web Platform";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
});
