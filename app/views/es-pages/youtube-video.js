define(['app','data/es-pages/media','directives/es-pages/header-nav'], function(app,media) { 'use strict';

return ['$routeParams','$scope','$sce', function ($routeParams,$scope,$sce) {

			var _ctrl = this;
			_ctrl.url= $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+$routeParams.id+'?rel=0');
			$sce.trustAsResourceUrl
			$scope.$root.page={};
			$scope.$root.page.title = "Media: Cristiana Pașca Palmer";
console.log($routeParams.id);

    }];
});
