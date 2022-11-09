import app from '~/app'
import { cssEscape } from '~/util/css.escape';
import template from './cbd-article-cover-image.html'

	app.directive('cbdArticleCoverImage', [function ()
	{
		return {
			restrict: 'E',
			template : template,
			replace: true,
			transclude: true,
			scope: {
				coverImage : '<coverImage'
			},
			link:function($scope){
				$scope.cssEscape = function(url){
					return cssEscape(url)
				}
			}
		};
	}]);
