import links from '~/data/bbi/links-platform.json'
import linksAbout from '~/data/bbi/links-about-platform.json'
import '~/directives/bbi/menu'
import '~/directives/bbi/menu-vert'
import '~/directives/bbi/auto-linker'

export { default as template } from './index.html'

export default ['$location','$scope', function ($location,$scope) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.linksAbout=linksAbout.links;
	console.log(_ctrl.linksAbout);
				_ctrl.goTo = goTo;

				$scope.$root.page={};
				$scope.$root.page.title = "About: BBI Web Platform";
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];