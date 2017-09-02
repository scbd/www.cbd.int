define(['app','services/fb','directives/es-pages/header-nav'], function(app) { 'use strict';

return ['$location','$scope','fb','$document', function ($location,$scope,fb,$document) {

			var _ctrl = this;

			$scope.$root.page={};


			angular.element($document).ready(function() {
				$scope.$root.page.title = "Cristiana Pașca Palmer's Biography";

				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', 'Cristiana Pașca Palmer was appointed by the United Nations Secretary-General as the Executive Secretary of the Secretariat of the Convention on Biological Diversity, starting 17 March 2017.');
				fb.set('og:url',window.location.href);

				fb.setImage('/app/images/es-pages/es5.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary/contact']);


			});
    }];
});
