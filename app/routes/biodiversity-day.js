import app from '~/app';
import { mapView, currentUser } from './mixin';

// Static views
import * as collage from '~/views/idb-celebrations/logos.html';
import * as customLogo from '~/views/idb-celebrations/logo.html';

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
        .when('/logo/collage',          { ...mapView(collage),          controllerAs: 'idbLogosCtrl',       resolveController: true, resolve : { status:resolveLiteral('approved'), user : currentUser() }})
        .when('/logo/collage/draft',    { ...mapView(collage),          controllerAs: 'idbDraftLogosCtrl',  resolveController: true, resolve : { status:resolveLiteral('draft'), user : securize(["Administrator","idb-logo-administrator"]) }})
        .when('/logo/collage/rejected', { ...mapView(collage),          controllerAs: 'idbRejectLogosCtrl', resolveController: true, resolve : { status:resolveLiteral('rejected'), user : securize(["Administrator","idb-logo-administrator"]) }})
        .when('/logo/customize',        { ...mapView(customLogo),       controllerAs: 'idbLogoCtrl',        resolveController: true, resolve : { user : currentUser() }})
        .otherwise({redirectTo: function(){ window.location.href= window.location}});
}]);
