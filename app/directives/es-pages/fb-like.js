define(['app', 'text!./fb-like.html','services/fb','services/fb'], function(app, html) { 'use strict';
	var _savedHtml;
	// (function(d, s, id) {
	//   var js, fjs = d.getElementsByTagName(s)[0];
	//   if (d.getElementById(id)) return;
	//   js = d.createElement(s); js.id = id;
	//   js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.10&appId=1483448981677752";
	//   fjs.parentNode.insertBefore(js, fjs);
	// }(document, 'script', 'facebook-jssdk'));


	return app.directive('fbLike',['$timeout','$route',function($timeout,$route) {
		return {

			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			compile: function ($elm) {

                  window.FB.XFBML.parse();

			}
		};
	}]);
});
