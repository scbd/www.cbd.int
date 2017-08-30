define(['app','directives/es-pages/header-nav','directives/es-pages/fb-timeline'], function(app,) { 'use strict';

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
    }];
});
