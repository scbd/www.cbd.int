import app from '~/app';
import { mapView, currentUser, resolveLiteral, securize } from './mixin';

import * as angularViewWrapper from '~/views/angular-view-wrapper'
const collage           = { component: ()=>import('~/views/biodiversity-day/collage') }
const customLogo        = { component: ()=>import('~/views/biodiversity-day/customize') }

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
        .when('/logo/collage/draft/:year?',    { ...mapView(angularViewWrapper),          resolve : { ...collage,   status:resolveLiteral('draft'),    user : securize(["Administrator","idb-logo-administrator"]) }})
        .when('/logo/collage/rejected/:year?', { ...mapView(angularViewWrapper),          resolve : { ...collage,   status:resolveLiteral('rejected'), user : securize(["Administrator","idb-logo-administrator"]) }})        
        .when('/logo/collage/:year?',          { ...mapView(angularViewWrapper),          resolve : { ...collage,   status:resolveLiteral('approved'), user : currentUser() }})
        .when('/logo/customize',               { ...mapView(angularViewWrapper),          resolve : { ...customLogo,user : currentUser() }})
        .otherwise({redirectTo: function(){ window.location.href= window.location}});
}]);
