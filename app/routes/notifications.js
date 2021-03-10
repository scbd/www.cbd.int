import app from 'app';
import { mapView } from './mixin';

// Static views
import * as notificationIdView  from '~/views/notifications/index-id'

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    .when('/:symbol', { ...mapView(notificationIdView) })
    .otherwise({redirectTo: '/404'});
}]);
