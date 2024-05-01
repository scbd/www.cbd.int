import app from '~/app';
import { securize, resolveLiteral, mapView } from './mixin';
import * as vueViewWrapper     from '~/views/vue-view-wrapper'

// Static views
import * as kmKnowledgeHub       from '~/views/km/knowledge-hub.vue'

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    
    $routeProvider
    .when('/knowledge-hub',  { ...mapView(vueViewWrapper),       resolve : { component : resolveLiteral(kmKnowledgeHub) }, reloadOnSearch:false })
    .otherwise({redirectTo: '/404'});
}]);
