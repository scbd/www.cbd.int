define(['app','data/es-pages/statements','directives/es-pages/header-nav','filters/title-case'], function(app,statements) { 'use strict';

return ['$routeParams','$scope','$sce','$location', function ($routeParams,$scope,$sce,$location) {

			var _ctrl = this;
			// if(~$routeParams.id.indexOf('twiiter')){
			// 	_ctrl.twitter=true;
			//     _ctrl.url=decodeURIComponent($routeParams.id);
			// }else
			// 	_ctrl.url= $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+$routeParams.id+'?rel=0');
			//
			// $scope.$root.page={};
			// $scope.$root.page.title = "Media: Cristiana Pașca Palmer";

			for(var i=0; i<statements.length;i++)
				if(statements[i]._id===$routeParams.id)
					_ctrl.statement=statements[i];

			if(!_ctrl.statement)$location.path('/404');



    }];
});
