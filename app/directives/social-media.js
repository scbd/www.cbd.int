define(['app', 'text!./social-media.html', 'https://platform.twitter.com/widgets.js', 'services/fb'], function(app, html) { 'use strict';

	return app.directive('socialMedia', ['$window', function($window) {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			link: function ($scope, $element) {

                $window.twttr.widgets.load($element.find('#twitterTimeline')[0]);


                if ($window.FB && $window.FB.XFBML){
                    $window.FB.XFBML.parse();
                }
               
			}
		};
	}]);
});
