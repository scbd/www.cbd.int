import links from '~/data/bbi/links.json'
import '~/directives/bbi/menu'
import '~/directives/bbi/auto-linker'

export { default as template } from './index-proj.html'

export default ['$location','$scope', function ($location,$scope) {

			var _ctrl = this;
			_ctrl.links=links.links;
			_ctrl.goTo = goTo;
			$scope.$root.page={};
			$scope.$root.page.title = "Projects: Bio Bridge Initiative";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];