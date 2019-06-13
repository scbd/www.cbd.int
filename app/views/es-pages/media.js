define(['app','services/fb','directives/es-pages/header-nav','filters/title-case','services/google-sheet-service'], function(app) { 'use strict';

return ['$scope','fb','$document','ngMeta','googleSheetService', function ($scope,fb,$document,ngMeta,googleSheetService) {

			var _ctrl = this;
			$scope.$root.page={};
			_ctrl.media = [];
			getMedia()
			
			angular.element($document).ready(function() {

				$scope.$root.page.title = "Mulitmedia collection of Cristiana Pașca Palmer.";
				$scope.$root.page.description = "The multimedia of Cristiana Pașca Palmer's work on UN Biodiversity Convention.";

				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', $scope.$root.page.description);
				fb.set('og:url',window.location.href);

				fb.setImage('https://attachments.cbd.int/es3.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary','https://www.cbd.int/executive-secretary/contact']);

				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','https://attachments.cbd.int/es3.jpg');
			});

			function getMedia() {
				var url = 'https://spreadsheets.google.com/feeds/cells/1_RSS-SjMifBEfUetPfr6GX8eJ3M4GMYrTrg4pXFIKkg/5/public/values?alt=json'
				return googleSheetService.get(url, 'media', 4)
					.then(addDataToMedia)
			}

			function addDataToMedia(dataRows) {
				_ctrl.media = _ctrl.media.concat(dataRows)
				_ctrl.media=_ctrl.media.sort(function(a, b) {
					a = new Date(a.startDate_dt);
					b = new Date(b.startDate_dt);
					return a>b ? -1 : a<b ? 1 : 0;
				})
				return _ctrl.media
			}
    }];
});
