import '~/directives/meetings/conference-header'
import app from '~/app';
import { securize, resolveLiteral, injectRouteParams, mapView, currentUser } from './mixin';
import * as angularViewWrapper from '~/views/angular-view-wrapper'
import * as vueViewWrapper     from '~/views/vue-view-wrapper'

// Static views
import * as conferencesView       from '~/views/meetings/conferences'
import * as conferencesIdView     from '~/views/meetings/index'
import * as documentsView         from '~/views/meetings/documents/documents'
import * as introductionView      from '~/views/meetings/introduction'
import * as articleView           from '~/views/articles/index'

// On-demand views
const documentIdView        = { component: ()=>import('~/views/meetings/documents/management/document-id') }
const inSessionView         = { component: ()=>import('~/views/meetings/documents/in-session-documents') }
const scheduleView          = { component: ()=>import('~/views/meetings/documents/agenda') }
const parallelMeetingsView  = { component: ()=>import('~/views/meetings/parallel-meetings') }
const notificationIdView    = { component: ()=>import('~/views/notifications/index-id') }
const virtualTableView      = { component: ()=>import('~/views/virtual-tables/index') }
const sessionListView       = { component: ()=>import('~/components/meetings/sessions/session-list.vue') }

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    //legacy redirect
    .when('/2016/cop-13-hls/documents',   { redirectTo    : '/2016/cop13-hls/documents'})
    .when('/2016/cp-mop-08/documents',    { redirectTo    : '/2016/mop-08/documents'})
    .when('/2016/cp-mop-8/documents',     { redirectTo    : '/2016/mop-08/documents'})

    .when('/',                                    { ...mapView(conferencesView) })
    .when('/:code',                               { ...mapView(conferencesIdView),   resolve: { }, reloadOnSearch:false })
    .when('/:code/parallel-meetings',             { ...mapView(angularViewWrapper),  resolve: { ...parallelMeetingsView, routePrams: injectRouteParams({urlTag: ['conferences', 'parallel-meetings', 'introduction'] }) }, reloadOnSearch:false })
    .when('/:code/parallel-meetings/:articleTag', { ...mapView(articleView),         resolve: { routePrams: injectRouteParams({urlTag: ['conferences', 'parallel-meetings'] }) },     reloadOnSearch:false })
    .when('/:code/media',                         { ...mapView(articleView),         resolve: { routePrams: injectRouteParams({urlTag: ['conferences', 'media', 'introduction'] }) }, reloadOnSearch:false })
    .when('/:code/media/:articleTag',             { ...mapView(articleView),         resolve: { routePrams: injectRouteParams({urlTag: ['conferences', 'media'] }) },                 reloadOnSearch:false })
    .when('/:code/information/:articleTag',       { ...mapView(articleView),         resolve: { routePrams: injectRouteParams({urlTag: ['conferences', 'information'] }) },           reloadOnSearch:false })    
    .when('/:code/virtual-tables',                { ...mapView(angularViewWrapper),  resolve: { ...virtualTableView, user:currentUser(), routePrams: injectRouteParams({type:'publication'}) }, reloadOnSearch:false})
    .when('/:code/virtual-tables/publications',   { ...mapView(angularViewWrapper),  resolve: { ...virtualTableView, user:currentUser(), routePrams: injectRouteParams({type:'publication'}) }, reloadOnSearch:false})
    .when('/:code/virtual-tables/events',         { ...mapView(angularViewWrapper),  resolve: { ...virtualTableView, user:currentUser(), routePrams: injectRouteParams({type:'event'}) }, reloadOnSearch:false})
    .when('/:code/schedules',                     { ...mapView(angularViewWrapper),  resolve: { ...scheduleView }, reloadOnSearch:true })
    .when('/:code/insession',                     { ...mapView(angularViewWrapper),  resolve: { ...inSessionView }, reloadOnSearch:false })
    .when('/:code/sessions',                      { ...mapView(vueViewWrapper),      resolve : { ...sessionListView,        user : securize(["Administrator","EditorialService", "StatementAdmin"]) }, reloadOnSearch:false })
    .when('/:code/:meeting',                      { ...mapView(introductionView),    resolve: { routePrams: injectRouteParams({ urlTag: ['conferences']}), showMeeting : resolveLiteral(false) } })
    .when('/:code/:meeting/documents',            { ...mapView(documentsView),       resolve: { showMeeting : resolveLiteral(false) },                    reloadOnSearch:false })
    .when('/:code/:meeting/documents/:id',        { ...mapView(angularViewWrapper),  resolve: { ...documentIdView, user : securize(["Administrator","EditorialService"]) },  reloadOnSearch:false })
    .when('/:code/submissions/:symbol',           { ...mapView(angularViewWrapper),  resolve: { ...notificationIdView, showMeeting : resolveLiteral(false) } })

    .otherwise({redirectTo: '/404'});
}]);

app.run(['$compile', '$rootScope','$location', async function($compile, $rootScope, $location){

    if($location.search().viewOnly) return;
    if($location.path()=='/')       return;

    var conferenceHeader = angular.element("#conferenceHeader");
    conferenceHeader.css('display', 'block');
    conferenceHeader.html('').append('<conference-header><conference-header>')
    $compile(conferenceHeader.contents())($rootScope);
}]);
