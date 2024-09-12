import 'angular-vue'
import VueI18n from 'vue-i18n'

export { default as template } from './vue-view-wrapper.html';

export default ['$scope', 'apiToken', '$route', 'component', 'locale',
 function ($scope, apiToken, $route, component, locale) {

  component = component.default || component;

  $scope.tokenReader = function(){ return apiToken.get()}
  $scope.route       = { params : $route.current.params }
  $scope.vueOptions  = {
    components: { component },
    // i18n: new VueI18n({ locale: locale, fallbackLocale: 'en', messages: { en: {} } })
  };
}];
