import app from '~/app';
import { securize, currentUser, mapView } from './mixin';
import * as vueViewWrapper     from '~/views/vue-view-wrapper'
import * as angularViewWrapper from '~/views/angular-view-wrapper'

// Static views
import * as redirectView     from '~/views/redirect'
import * as searchView       from '~/views/decisions/search'
import * as decisionListView from '~/views/decisions/list'
import * as paragraphView    from '~/views/decisions/paragraph'

// On-demand views
const decisionView        = { component: ()=>import('~/views/decisions/decision-view.vue').catch(logError) }
const editDecisionView    = { component: ()=>import('~/views/decisions/edit').catch(logError) }
const editTranslationView = { component: ()=>import('~/views/decisions/edit-translation.vue').catch(logError) }

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    
    $routeProvider
    .when('/',                                    { ...mapView(redirectView),           resolve: { } })
    .when('/search',                              { ...mapView(searchView) ,            resolve: { user : currentUser() }, reloadOnSearch : false } )
    .when('/:body',                               { ...mapView(redirectView),           resolve: { } })
    .when('/:body/:session',                      { ...mapView(decisionListView),       resolve: { user : currentUser() } } )
    .when('/:body/:session/:decision*',           { ...mapView(vueViewWrapper),         resolve: { ...decisionView, user : currentUser()}, reloadOnUrl:false})
    .when('/:body/:session/:decision/edit',       { ...mapView(angularViewWrapper),     resolve: { ...editDecisionView, user : securize(["Administrator","DecisionTrackingTool", "ScbdStaff"]) } } )
    .when('/:body/:session/:decision/edit/translation', { ...mapView(vueViewWrapper),   resolve: { ...editTranslationView, user : securize(["Administrator","DecisionTrackingTool"]) } } )
    .when('/:body/:session/:decision/:paragraph', { ...mapView(paragraphView),          resolve: { user : currentUser() } })
    .otherwise({redirectTo: '/404'});
}]);

function logError(err) {
    console.log(err)
    throw err;
}