define(['app', 'data/bbi/links-platform', 'data/bbi/links-about-platform',  'directives/bbi/menu','directives/bbi/menu-vert','directives/bbi/auto-linker'], function(app,links,linksAbout) { 'use strict';

	return ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.linksAbout=linksAbout.links;
	console.log(_ctrl.linksAbout);
				_ctrl.goTo = goTo;

				$scope.$root.page={};
				$scope.$root.page.title = "About: BBI Web Platform";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
});
