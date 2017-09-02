define(['app', 'text!./header-nav.html'], function(app, html) { 'use strict';

	return app.directive('headerNav',['$location',function($location) {
		return {

			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			link: function ($scope,$elm) {
				 $elm.find('a').each(function(){

					 if(~this.href.indexOf($location.path()) && $location.path().length>1)
					 	angular.element(this).addClass('active');

				 })

			}
		};
	}]);
});
