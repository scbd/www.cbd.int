import app from '~/app';
import { mapView, securize, currentUser } from './mixin';

// Static views
import * as indexView          from '~/views/kronos/index'
import * as angularViewWrapper from '~/views/angular-view-wrapper'

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    .when('/',                     { ...mapView(indexView),          controllerAs: 'indexCtrl',         resolve: { user : currentUser() }  })
    .when('/media-requests',       { ...mapView(angularViewWrapper), controllerAs: 'mediaRequestCtrl',  resolve: { component:()=>import('~/views/kronos/media-requests/index'),       user : securize(["Administrator","Kronos-FullAccess","SCBDMedia"]) }  })
    .when('/media-requests/:code', { ...mapView(angularViewWrapper), controllerAs: 'mediaRequestCtrl',  resolve: { component:()=>import('~/views/kronos/media-requests/index'),       user : securize(["Administrator","Kronos-FullAccess","SCBDMedia"]) }  })
    .otherwise({redirectTo: '/404'});
}]);
