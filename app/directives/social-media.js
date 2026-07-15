import app from '~/app'
import html from './social-media.html'
import 'require'

	app.directive('socialMedia', ['$window', function($window) {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			link: function ($scope, $element) {

				import('~/services/fb').then(function(){
					setTimeout(() => {
						if ($window.FB && $window.FB.XFBML){
							$window.FB.XFBML.parse();
							setServiceReady('facebook');
						}
					}, 1000);
				});

				function setServiceReady(service) {
					$scope.$applyAsync(function(){
						$scope[service]=true;
					});
				}
			}
		};
	}]);