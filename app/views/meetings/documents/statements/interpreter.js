define(['lodash', 'angular', 'components/meetings/sessions/interpreters-view', 'angular-vue', 'css!https://cdn.cbd.int/vue-multiselect@2.1.6/dist/vue-multiselect.min.css' ], function(_, ng, component ) {


	return ['$scope', 'apiToken', function ($scope, apiToken) {

        var _ctrl = $scope.documentsCtrl = this;

        $scope.tokenReader = function(){ return apiToken.get()}

        _ctrl.vueOptions = {
          components: { interpretersView: component },
          i18n: new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: {} } })
        };

    }];
});