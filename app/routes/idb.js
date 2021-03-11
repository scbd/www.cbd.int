import app from 'app';
import { mapView, currentUser } from './mixin';

// Static views
import * as indexView   from '~/views/idb-celebrations/idb-cel-index'
import * as profileView from '~/views/idb-celebrations/idb-profile'

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    .when('/:year/celebrations',       { ...mapView(indexView),   controllerAs: 'idbCelIndexCtrl',  resolve : { user : currentUser() }})
    .when('/:year/celebrations/:gov',  { ...mapView(profileView), controllerAs: 'idbProfileCtrl',   resolve : { user : currentUser() }})
    .otherwise({redirectTo: function(){ window.location.href= window.location}});
}]);
