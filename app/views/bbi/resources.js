import links from '~/data/bbi/links.json'
import '~/directives/bbi/crumbs'
import '~/directives/bbi/menu'

export { default as template } from './resources.html'

export default ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;

				$scope.$root.page={};
        $scope.$root.page.title = "Resources: BBI Web Platform";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];