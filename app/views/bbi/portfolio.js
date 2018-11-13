
define(['app', 'lodash','data/bbi/links', 'directives/bbi/menu'], function(app, _,links) { 'use strict';

	return ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;

				$scope.$root.page={};
				$scope.$root.page.title = "Technical and Scientific Cooperation Portfolio";

        function goTo (url) {
					$location.path(url);
				}
    }];
});
