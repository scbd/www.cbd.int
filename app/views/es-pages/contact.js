define(['app','services/fb','directives/es-pages/header-nav'], function(app) { 'use strict';

return ['$location','$scope','fb','$document','ngMeta', function ($location,$scope,fb,$document,ngMeta) {

			var _ctrl = this;

			$scope.$root.page={};


			angular.element($document).ready(function() {
				$scope.$root.page.title = "Contact: Cristiana Pașca Palmer";

				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', 'Contact information for Cristiana Pașca Palmer, Executive Secretary of the UN Biodiversity Convention. UN Assistant Secretary-General.');
				fb.set('og:url',window.location.href);

				fb.setImage('https://attachments.cbd.int/profile-pic.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary']);

				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','https://attachments.cbd.int/profile-pic.jpg');
			});
    }];
});