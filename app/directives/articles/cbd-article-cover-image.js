import app from '~/app'
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
			}
		};
	}]);
