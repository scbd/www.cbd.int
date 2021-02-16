define(['lodash', 'angular', 'components/meetings/sessions/edit', 'angular-vue', 'css!https://cdn.cbd.int/vue-multiselect@2.1.6/dist/vue-multiselect.min.css' ], function(_, ng, sessionEdit) {


	return ['$scope', 'apiToken', '$route', function ($scope, apiToken, $route) {

        $scope.tokenReader = function(){ return apiToken.get()}
        $scope.route       = { params : $route.current.params }
        $scope.vueOptions  = {
          components: { sessionEdit: sessionEdit },
          i18n: new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: {} } })
        };
    }];
});