define(['app','directives/es-pages/header-nav'], function(app,) { 'use strict';

return ['$location','$scope', function ($location,$scope) {

			var _ctrl = this;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "Bio: Cristiana Pașca Palmer";

			//============================================================
			//
			//============================================================
			function goTo (url) {
					$location.path(url);
			}
    }];
});
