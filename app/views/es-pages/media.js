define(['app','data/es-pages/media','directives/es-pages/header-nav','filters/title-case'], function(app,media) { 'use strict';

return ['$location','$scope', function ($location,$scope) {

			var _ctrl = this;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "Media: Cristiana Pașca Palmer";
			_ctrl.media = media;

			//============================================================
			//
			//============================================================
			function goTo (url) {
				$location.path(url);
			}
    }];
});
