define(['app', 'text!./fb-timeline.html','services/fb'], function(app, html) { 'use strict';
var _savedHtml;

	return app.directive('fbTimeline',['$timeout','$compile',function($timeout,$compile) {
		return {

			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			compile: function ($elm) {
                (function(d, s, id) {
                  var js, fjs = d.getElementsByTagName(s)[0];
                  if (d.getElementById(id)) return;
                  js = d.createElement(s); js.id = id;
                  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.10&appId=1483448981677752";
                  fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));

                    if(_savedHtml)
                        window.FB.XFBML.parse();

                    if(!_savedHtml)
                      _savedHtml = $elm.html();

			}
		};
	}]);
});
