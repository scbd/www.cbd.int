import links from '~/data/bbi/links.json'

export { default as template } from './project-review-panel.html'

export default ['$location','$scope', function ($location,$scope) {

			var _ctrl = this;
			_ctrl.links=links.links;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "Completed Projects: Bio Bridge Initiative";

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
