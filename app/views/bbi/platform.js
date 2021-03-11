import '~/directives/bbi/crumbs'
import '~/directives/bbi/menu'
import links from 'data/bbi/links-platform'

export { default as template } from './platform.html'

export default ['$location','$scope','user', function ($location,$scope,user) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
				_ctrl.user=user;
				$scope.$root.page={};
				$scope.$root.page.title = "BBI Web Platform";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];