define(['lodash', 'angular', 'components/meetings/sessions/interpreters-view', 'angular-vue', 'css!https://cdn.cbd.int/vue-multiselect@2.1.6/dist/vue-multiselect.min.css' ], function(_, ng, component ) {


	return ['$scope', 'apiToken', '$route', function ($scope, apiToken, $route) {

        var _ctrl = $scope.documentsCtrl = this;

        $scope.tokenReader = function(){ return apiToken.get()}
        $scope.route       = { params : $route.current.params }
        $scope.vueOptions  = {
          components: { interpretersView: component },
          i18n: new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: {} } })
        };
    }];
});