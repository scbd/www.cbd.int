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
                title    : 'International Day of the World’s Indigenous Peoples',
                abstract : '9 August 2017: "Ten years of the United Nations Declaration on the Rights of Indigenous Peoples"',
                url      : '/todo/1',
                imageUrl : '/app/images/es-pages/es1.jpg'
            },
            {
                title    : 'International Day 2 of the World’s Indigenous Peoples',
                abstract : '12 September 2017: "Ten years of the United Nations Declaration on the Rights of Indigenous Peoples"',
                url      : '/todo/2',
                imageUrl : '/app/images/es-pages/es2.jpg'
            }];
    }];
});
