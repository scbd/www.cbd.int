define(['app','services/fb','directives/carousel', 'directives/es-pages/header-nav','directives/es-pages/fb-timeline'], function() { 'use strict';
		window.twttr = (function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0],
		t = window.twttr || {};
		if (d.getElementById(id)) return t;
		js = d.createElement(s);
		js.id = id;
		js.src = "https://platform.twitter.com/widgets.js";
		fjs.parentNode.insertBefore(js, fjs);

		t._e = [];
		t.ready = function(f) {
		t._e.push(f);
		};

		return t;
		}(document, "script", "twitter-wjs"));

return ['$location','$scope','fb','$document', function ($location,$scope,fb,$document) {

	$scope.carousel = [{
		title    : 'CMS COP12',
		abstract : '22-28 October 2017: 12th Session of the Conference of the Parties to the Convention on the Conservation of Migratory Species of Wild Animals, Bonn, Germany.',
		url      : '/todo/1',
		imageUrl : '/app/images/es-pages/es5.jpg'
	},
	{
		title    : 'Bucharest Forum',
		abstract : '5-7 October 2017: Focusing on the needs of economic and strategic decision makers in the region between the Adriatic, Black Sea and the Caspian Sea.',
		url      : '/todo/1',
		imageUrl : '/app/images/es-pages/es3.jpg'
	},
	{
		title    : 'UN General Assembly',
		abstract : '14 September 2017: Focusing on People: Striving for Peace and a Decent Life for All on a Sustainable Planet',
		url      : '/todo/1',
		imageUrl : '/app/images/es-pages/es1.jpg'
	},
	{
		title    : 'UNWTO General Assembly',
		abstract : '13 September 2017: 22nd Session of the General Assembly of the World Tourism Organization, Chengdu, China.',
		url      : '/todo/2',
		imageUrl : '/app/images/es-pages/es2.jpg'
	},
	{
		title    : 'UNCCD COP13',
		abstract : '11 September 2017: 13th session of the Conference of the Parties to the United Nations Convention to Combat Desertification, Ordos, China.',
		url      : '/todo/2',
		imageUrl : '/app/images/es-pages/es4.jpg'
	},
	{
		title    : 'International Day 2 of the World’s Indigenous Peoples',
		abstract : '12 September 2017: "Ten years of the United Nations Declaration on the Rights of Indigenous Peoples"',
		url      : '/todo/2',
		imageUrl : '/app/images/es-pages/es6.jpg'
	},
	{
		title    : 'International Day 2 of the World’s Indigenous Peoples',
		abstract : '12 September 2017: "Ten years of the United Nations Declaration on the Rights of Indigenous Peoples"',
		url      : '/todo/2',
		imageUrl : '/app/images/es-pages/es7.jpg'
	}
];

			var _ctrl = this;
			_ctrl.goTo = goTo;
			$scope.$root.page={};

			angular.element($document).ready(function() {

				$scope.$root.page.title = "Cristiana Pașca Palmer, Executive Secretary of the UN Biodiversity Convention. UN Assistant Secretary-General";

				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', 'The latest news, statements and events from Cristiana Pașca Palmer.');
				fb.set('og:url',window.location.href);

				fb.setImage('app/images/es-pages/profile-pic.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary/contact']);
					if(false){
						var jsonLd = angular.element(document.getElementById('structuredContent'))[0];
						jsonLd.innerHTML = angular.toJson(_ctrl.post.googleMarkUp);
					}

			});

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}


    }];
});
