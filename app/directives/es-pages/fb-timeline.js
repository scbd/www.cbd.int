define(['app', 'text!./fb-timeline.html','services/fb'], function(app, html) { 'use strict';
var _savedHtml;

	return app.directive('fbTimeline',['$timeout','$compile',function($timeout,$compile) {
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
