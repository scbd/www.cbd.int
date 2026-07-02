import 'angular-vue'

export { default as template } from './vue-view-wrapper.html';

export default ['$scope', 'apiToken', '$route', 'component',
 function ($scope, apiToken, $route, component) {

  component = component.default || component;

  $scope.tokenReader = function(){ return apiToken.get()}
  $scope.route       = { params : $route.current.params }
  $scope.vueOptions  = {
    components: { component }
  };
}];
