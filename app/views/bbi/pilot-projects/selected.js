define(['app', 'data/bbi/links',  'data/bbi/projects','directives/bbi/bbi-project-row','directives/bbi/menu'], function(app,links,projects) { 'use strict';

return ['$location','$scope', function ($location,$scope) {

			var _ctrl = this;
			_ctrl.links=links.links;
      _ctrl.projects=projects.projects;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "Selected Projects: Bio Bridge Initiative";

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
});
