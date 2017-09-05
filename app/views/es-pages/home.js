define(['app','services/fb','directives/carousel', 'directives/es-pages/header-nav'], function() { 'use strict';


return ['$location','$scope','fb','$document','ngMeta', function ($location,$scope,fb,$document,ngMeta) {

	$scope.carousel = [{
		title    : 'CMS COP12',
		abstract : '22-28 October 2017: 12th Session of the Conference of the Parties to the Convention on the Conservation of Migratory Species of Wild Animals, Bonn, Germany.',
		url      : 'https://www.cbd.int/2011-2020/dashboard/submit/event/FDF9A151-FC8B-E4CE-FE41-9B0AC2E8ED22/view',
		imageUrl : '/app/images/es-pages/es5.jpg'
	},
	{
		title    : 'Bucharest Forum',
		abstract : '5-7 October 2017: Focusing on the needs of economic and strategic decision makers in the region between the Adriatic, Black Sea and the Caspian Sea.',
		url      : 'https://www.cbd.int/2011-2020/dashboard/submit/event/A0988E99-A1E5-72FA-BD83-1E7214CB3AD1/view',
		imageUrl : '/app/images/es-pages/es1.jpg'
	},
	{
		title    : 'UN General Assembly',
		abstract : '14 September 2017: Focusing on People: Striving for Peace and a Decent Life for All on a Sustainable Planet',
		url      : 'https://www.cbd.int/2011-2020/dashboard/submit/event/6A17F3CB-AD7F-2220-4A8F-34012AA21690/view',
		imageUrl : '/app/images/es-pages/es8.jpg'
	},
	{
		title    : 'UNWTO General Assembly',
		abstract : '13 September 2017: 22nd Session of the General Assembly of the World Tourism Organization, Chengdu, China.',
		url      : 'https://www.cbd.int/2011-2020/dashboard/submit/event/118BF43B-9A22-B5DF-FA10-C1B86CF60916/view',
		imageUrl : '/app/images/es-pages/es2.jpg'
	},
	{
		title    : 'UNCCD COP13',
		abstract : '11 September 2017: 13th session of the Conference of the Parties to the United Nations Convention to Combat Desertification, Ordos, China.',
		url      : 'https://www.cbd.int/2011-2020/dashboard/submit/event/0F60F9EA-2127-E0C7-26C6-E509068B3F67/view',
		imageUrl : '/app/images/es-pages/es3.jpg'
	}//ABE81109-C9D1-16BD-808A-28782F045AA3
];

			var _ctrl = this;
			_ctrl.goTo = goTo;
			$scope.$root.page={};

			angular.element($document).ready(function() {

				$scope.$root.page.title = "Cristiana Pașca Palmer, Executive Secretary of the UN Biodiversity Convention. UN Assistant Secretary-General.";
				$scope.$root.page.description = 'The latest news, statements and events from Cristiana Pașca Palmer work on UN Biodiversity Convention.'
				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', $scope.$root.page.description);
				fb.set('og:url',window.location.href);

				fb.setImage('/app/images/es-pages/es5.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary/contact']);

				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','/app/images/es-pages/es5.jpg');

			});

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}


    }];
});
