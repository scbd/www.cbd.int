import app from 'app';
import { securize, resolveLiteral, mapView } from './mixin';
import * as vueViewLoader     from '~/views/vue'
import * as angularViewLoader from '~/views/vue' // TO IMPLEMENT: '~/views/angular'

// Static views
import * as documentsView from '~/views/meetings/documents/documents'

// On-demand views
const sessionListView        = { component: ()=>import('~/components/meetings/sessions/session-list.vue') }
const sessionIdView          = { component: ()=>import('~/components/meetings/sessions/edit.vue') }
const interpretersPanelView  = { component: ()=>import('~/components/meetings/sessions/interpreters-view.vue') }

const importTranslationsView = { component: ()=>import('~/views/meetings/documents/management/translations') }
const editDocumentIdView     = { component: ()=>import('~/views/meetings/documents/management/document-id') }


app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    
    $routeProvider
//  .when('/:meeting/documents/status',    { templateUrl : 'views/meetings/documents/documents-progress.html',      resolveController : true, reloadOnSearch:false, resolve : { user : securize(["Administrator","EditorialService", "ScbdStaff"]) } })
    .when('/import-translations',          { ...mapView(angularViewLoader),   resolve : { ...importTranslationsView, user : securize(["Administrator","EditorialService"]) } })
    .when('/:meeting/documents/:id',       { ...mapView(angularViewLoader),   resolve : { ...editDocumentIdView,     user : securize(["Administrator","EditorialService"]) },  reloadOnSearch:false })
    .when('/:meeting/sessions',            { ...mapView(vueViewLoader),       resolve : { ...sessionListView,        user : securize(["Administrator","EditorialService", "StatementAdmin"]) }, reloadOnSearch:false })
    .when('/:meeting/sessions/:sessionId', { ...mapView(vueViewLoader),       resolve : { ...sessionIdView,          user : securize(["Administrator","EditorialService", "StatementAdmin"]) }, reloadOnSearch:false })
    .when('/:meeting/interpreter-panel',   { ...mapView(vueViewLoader),       resolve : { ...interpretersPanelView,  user : securize(["Administrator","EditorialService", "StatementAdmin", "ScbdStaff", "Interpreters"]) }, reloadOnSearch:false })
    .when('/:meeting/documents',           { redirectTo  : '/:meeting'} )
    .when('/:meeting',                     { ...mapView(documentsView),           resolve : { showMeeting : resolveLiteral(false) }, reloadOnSearch:false })
    .otherwise({redirectTo: '/404'});
}]);
