import './disclaimer'
import app from 'app'
import template from './header-decisions.html'

	app.directive('headerDecisions', [function() {
		return {
			restrict : "E",
			template : template,
			replace: true,
			transclude: true,
			scope: {},
			link: function () {}
        }
    }]);