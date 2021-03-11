import 'ngRoute'
import app from '~/app';
import { mapView, currentUser, securize, injectRouteParams } from './mixin';

// Static views
import * as downloadView from '~/views/media-requests/download'
import * as detectView   from '~/views/media-requests/detect'
import * as requestsView from '~/views/media-requests/requests'
import * as formView     from '~/views/media-requests/participation-form'

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    .when('/download/:file*?',                   { ...mapView(downloadView), controllerAs: 'downloadCtrl',       resolve: { user : currentUser() } } )
    .when('/:conference/media',                  { ...mapView(detectView),                                       resolve: { user : currentUser(), routeParams: injectRouteParams({ type: 'media' })  } } )
    .when('/:conference/:type/requests',         { ...mapView(requestsView), controllerAs: 'requestsCtrl',       resolve: { user : securize(['User']) } } )
    .when('/:conference/:type/checklist',        { ...mapView(formView),     controllerAs: 'participationCtrl',  resolve: { user : securize(['User']), routeParams: injectRouteParams({step: 'checklist' })  }, reloadOnSearch:false } )
    .when('/:conference/:type/:requestId/:step', { ...mapView(formView),     controllerAs: 'participationCtrl',  resolve: { user : securize(['User']) }, reloadOnSearch:false } )
    .otherwise({redirectTo: '/404'});
}]);
