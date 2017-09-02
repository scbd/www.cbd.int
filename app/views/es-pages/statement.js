define(['app','data/es-pages/statements','directives/es-pages/header-nav','filters/title-case','services/fb'], function(app,statements) { 'use strict';

return ['$routeParams','$scope','$sce','$location','fb','$document', function ($routeParams,$scope,$sce,$location,fb,$document) {

			var _ctrl = this;

			for(var i=0; i<statements.length;i++)
				if(statements[i]._id===$routeParams.id)
					_ctrl.statement=statements[i];

			if(!_ctrl.statement)$location.path('/404');
			angular.element($document).ready(function() {

				$scope.$root.page.title = "Statement from Cristiana Pașca Palmer: "+_ctrl.statement.title_s;

				fb.setTitle($scope.$root.page.title,' ');
				fb.setOgType('article');
				fb.set('article:author',['https://www.facebook.com/CristianaPascaPalmer/']);
				fb.set('article:published_time',_ctrl.statement.startDate_dt);
				fb.set('article:publisher',['https://www.facebook.com/UN.CBD/']);
				fb.set('article:section','statements');

				fb.set('og:url',window.location.href);

				fb.setImage(_ctrl.statement.img);



			});
    }];
});
