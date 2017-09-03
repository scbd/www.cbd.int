define(['app','directives/es-pages/header-nav','filters/title-case'], function(app) { 'use strict';

return ['$routeParams','$scope','$sce','$location','$window','$document', function ($routeParams,$scope,$sce,$location,$window,$document) {

			var _ctrl = this;
			// if(~$routeParams.id.indexOf('twiiter')){
			// 	_ctrl.twitter=true;
			//     _ctrl.url=decodeURIComponent($routeParams.id);
			// }else
			// 	_ctrl.url= $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+$routeParams.id+'?rel=0');
			//
			// $scope.$root.page={};
			// $scope.$root.page.title = "Media: Cristiana Pașca Palmer";

window.location.replace("https://www.cbd.int/2011-2020/dashboard/submit/event/"+$routeParams.id+"/view", "_self")



    }];
});
