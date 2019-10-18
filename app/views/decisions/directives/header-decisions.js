define(['app', 'text!./header-decisions.html', './disclaimer'], function(app, template) { 'use strict';

	return app.directive('headerDecisions', [function() {
		return {
			restrict : "E",
			template : template,
			replace: true,
			transclude: true,
			scope: {},
			link: function () {}
        }
    }]);
});
