import links from '~/data/bbi/links.json'
import '~/directives/bbi/menu'

export { default as template } from './portfolio.html'

export default ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;

				$scope.$root.page={};
				$scope.$root.page.title = "Technical and Scientific Cooperation Portfolio";

        function goTo (url) {
					$location.path(url);
				}
    }];
