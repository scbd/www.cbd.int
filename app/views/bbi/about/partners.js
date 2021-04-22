import '~/directives/bbi/crumbs'
import '~/directives/bbi/menu'
import '~/directives/bbi/auto-linker'
import links from '~/data/bbi/links.json'

export { default as template } from './partners.html'

export default ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;

				$scope.$root.page={};
				$scope.$root.page.title = "Partners: Bio Bridge Initiative";
							
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];