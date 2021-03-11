import 'ngRoute'
import app from '~/app';
import { mapView } from './mixin';

// Static views
import * as aichiTargetsView  from '~/views/aichi-targets/index'
import * as aichiTargetIdView from '~/views/aichi-targets/index-id'

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    .when('/',                  { ...mapView(aichiTargetsView),  controllerAs: 'indexCtrl' })
    .when('/target/:targetId',  { ...mapView(aichiTargetIdView), controllerAs: 'indexIdCtrl' })
    .otherwise({redirectTo: '/404'});
}]);
