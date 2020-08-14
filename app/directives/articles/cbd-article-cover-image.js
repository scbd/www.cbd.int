define(['app', 'text!./cbd-article-cover-image.html'], function(app, template) { 'use strict';

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
});