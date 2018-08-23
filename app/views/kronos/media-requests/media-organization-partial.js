define(['app', 'text!./media-organization-partial.html', 'filters/term'], function(app, html) { 'use strict';

	return app.directive('mediaOrganization', [function() {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                document : '=ngModel'
            },
			link: function ($scope) {                
			}
		};
	}]);
});
