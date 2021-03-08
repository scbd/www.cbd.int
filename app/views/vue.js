import 'angular-vue'
import template from './vue.html';

export { default as template } from './vue.html';

export default ['$scope', 'apiToken', '$route', 'component', function ($scope, apiToken, $route, component) {
  $scope.tokenReader = function(){ return apiToken.get()}
  $scope.route       = { params : $route.current.params }
  $scope.vueOptions  = {
    components: { component },
  };
}];