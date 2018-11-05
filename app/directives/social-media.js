define(['app', 'text!./social-media.html', 'require'], function(app, html, require) { 'use strict';

	return app.directive('socialMedia', ['$window', function($window) {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			link: function ($scope, $element) {

				require(['https://platform.twitter.com/widgets.js'], function(){
					$window.twttr.widgets.load($element.find('#twitterTimeline')[0]);
					setServiceReady('twitter');
				})

				require(['services/fb'], function(){
					if ($window.FB && $window.FB.XFBML){
						$window.FB.XFBML.parse();
						setServiceReady('facebook');
					}
				});

				function setServiceReady(service) {
					$scope.$applyAsync(function(){
						$scope[service]=true;
					});
				}
			}
		};
	}]);
});
