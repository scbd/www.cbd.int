import links from '~/data/bbi/links.json'
import '~/directives/bbi/auto-linker'
import '~/directives/bbi/menu'

export { default as template } from './faq.html'

export default ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;

				$scope.$root.page={};
				$scope.$root.page.title = "FAQ: Bio Bridge Initiative";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
