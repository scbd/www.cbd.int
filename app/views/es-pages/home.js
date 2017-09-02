define(['app','directives/carousel', 'directives/es-pages/header-nav','directives/es-pages/fb-timeline'], function() { 'use strict';

return ['$location','$scope', function ($location,$scope) {


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


// twttr.widgets.createTweet(
//   "20",
//   document.getElementById("tweet-container"),
//   {
//     linkColor: "#55acee"
//   }
// );
			var _ctrl = this;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "Cristiana Pașca Palmer, Executive Secretary UN Biodiversity Convention. UN Assistant Secretary-General";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}

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
    }];
});
