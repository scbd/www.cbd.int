import '~/directives/bbi/menu'
import '~/directives/bbi/auto-linker'
import links from '~/data/bbi/links.json'

export { default as template } from './index-about.html';

export default ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
				$scope.$root.page={};
				$scope.$root.page.title = "About: Bio Bridge Initiative";				
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];