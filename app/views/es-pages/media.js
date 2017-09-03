define(['app','data/es-pages/media','services/fb','directives/es-pages/header-nav','filters/title-case'], function(app,media) { 'use strict';

return ['$location','$scope','fb','$document','ngMeta', function ($location,$scope,fb,$document,ngMeta) {

			var _ctrl = this;
			$scope.$root.page={};
			_ctrl.media = media;

			angular.element($document).ready(function() {

				$scope.$root.page.title = "Mulitmedia collection of Cristiana Pașca Palmer.";
				$scope.$root.page.description = "The multimedia of Cristiana Pașca Palmer's work on UN Biodiversity Convention.";

				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', $scope.$root.page.description);
				fb.set('og:url',window.location.href);

				fb.setImage('/app/images/es-pages/es3.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary','https://www.cbd.int/executive-secretary/contact']);

				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','/app/images/es-pages/es3.jpg');
			});
    }];
});
