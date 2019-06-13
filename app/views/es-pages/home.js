define(['app','services/fb','directives/carousel', 'directives/es-pages/header-nav', 'services/google-sheet-service'], function() { 'use strict';


return ['$location','$scope','fb','$document','ngMeta','googleSheetService', function ($location,$scope,fb,$document,ngMeta,googleSheetService) {

			$scope.carousel=undefined;
			query();

			var _ctrl = this;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.carousel = []
			angular.element($document).ready(function() {

				$scope.$root.page.title = "Cristiana Pașca Palmer, Executive Secretary of the UN Biodiversity Convention. UN Assistant Secretary-General.";
				$scope.$root.page.description = 'The latest news, statements and events from Cristiana Pașca Palmer work on UN Biodiversity Convention.'
				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', $scope.$root.page.description);
				fb.set('og:url',window.location.href);

				fb.setImage('https://attachments.cbd.int/es5.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary/contact']);

				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','https://attachments.cbd.int/es5.jpg');

			});

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}

				function extractFirstParagraph (txt) {
				  var rx = /(^).*?(?=\n|$)/g;
				  var arr = rx.exec(txt);

          if(arr && arr[0])
				      if(typeof arr[0] === 'string' && arr[0].length>130)
                      arr[0] = arr[0].substring(0,130);
				  return arr[0] || txt;
				}
				//=======================================================================
				//
				//=======================================================================
				function query() {
					var url = 'https://spreadsheets.google.com/feeds/cells/1_RSS-SjMifBEfUetPfr6GX8eJ3M4GMYrTrg4pXFIKkg/4/public/values?alt=json'
					return googleSheetService.get(url, 'es-carousel', 4)
						.then(saveToScope)
				} // query

				function saveToScope(dataRows) {
					$scope.carousel = $scope.carousel.concat(dataRows)
					return $scope.carousel
				}

    }];
});
