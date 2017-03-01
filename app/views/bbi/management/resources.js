define(['app', 'lodash','data/bbi/links', 'directives/bbi/crumbs', 'directives/bbi/menu'], function(app, _,links) { 'use strict';

	return ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;

				$scope.$root.page={};
        $scope.$root.page.title = "Resources: BBI Web Platform";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
});
