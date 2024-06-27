import _ from 'lodash';
import ng from 'angular';
import sessionEdit from 'components/meetings/sessions/edit';
import 'angular-vue';
import 'css!https://cdn.cbd.int/vue-multiselect@2.1.6/dist/vue-multiselect.min.css';


	export default ['$scope', 'apiToken', '$route', function ($scope, apiToken, $route) {

        $scope.tokenReader = function(){ return apiToken.get()}
        $scope.route       = { params : $route.current.params }
        $scope.vueOptions  = {
          components: { sessionEdit: sessionEdit },
          // i18n: new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: {} } })
        };
    }];
