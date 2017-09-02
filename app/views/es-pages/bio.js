define(['app','services/fb','directives/es-pages/header-nav'], function(app) { 'use strict';

return ['$location','$scope','fb','$document','ngMeta', function ($location,$scope,fb,$document,ngMeta) {

			var _ctrl = this;

			$scope.$root.page={};


			angular.element($document).ready(function() {
				$scope.$root.page.title = "Cristiana Pașca Palmer's Biography";
				$scope.$root.page.description='Cristiana Pașca Palmer was appointed by the United Nations Secretary-General as the Executive Secretary of the Secretariat of the Convention on Biological Diversity, starting 17 March 2017.'
				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description',$scope.$root.page.description );
				fb.set('og:url',window.location.href);

				fb.setImage('/app/images/es-pages/es5.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary/contact']);

				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','/app/images/es-pages/es5.jpg');
			});
    }];
});
