import links from '~/data/bbi/links-platform.json'
import '~/directives/bbi/menu'
import '~/directives/bbi/search/search'
  
export { default as template } from './search.html'

export default ['$location','$route','$scope','user', function ($location,$route,$scope,user) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;
        _ctrl.user = {};
  
				_ctrl.schema = _.camelCase($route.current.params.schema);
				init();
				$scope.$root.page={};
        $scope.$root.page.title = "Search: BBI Web Platform";
				//============================================================
				//
				//============================================================
				function init () {
								setSchema();
				}
				//============================================================
				//
				//============================================================
				function setSchema (url) {
								if(_ctrl.schema){
									$location.replace();
									$location.search("schema_s",_ctrl.schema);
								}
				}
				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];