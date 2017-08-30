define(['app', 'text!./header-nav.html'], function(app, html) { 'use strict';

	return app.directive('headerNav',['$location',function($location) {
		return {

			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			link: function ($scope,$elm) {
				 console.log($location.path());
				//  $elm.find()
			}
		};
	}]);
});
