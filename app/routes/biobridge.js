import app from '~/app';
import { securize, currentUser, mapView } from './mixin';
import * as angularViewWrapper from '~/views/angular-view-wrapper'
import * as indexView          from '~/views/bbi/index-bbi';


app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    .when('/',                                 { ...mapView(indexView),          controllerAs: 'indexCtrl',              resolve: { } })
    .when('/platform/submit/:schema',          { ...mapView(angularViewWrapper), controllerAs: 'submitCtrl',             resolve: { component:()=>import('~/views/bbi/management/record-list'), user : securize(['User']) } })
    .when('/platform/submit/:schema/:id',      { ...mapView(angularViewWrapper), controllerAs: 'editCtrl' ,              resolve: { component:()=>import('~/views/bbi/management/edit'),        user : securize(['User']) }})
    .when('/platform/submit/:schema/:id/view', { ...mapView(angularViewWrapper), controllerAs: 'viewCtrl',               resolve: { component:()=>import('~/views/bbi/management/view'),        user : currentUser() } })
    .when('/platform/dashboard'              , { ...mapView(angularViewWrapper), controllerAs: 'dashCtrl' ,              resolve: { component:()=>import('~/views/bbi/management/index-man'),   user : securize(['User']) }})
    .when('/platform/search',                  { ...mapView(angularViewWrapper), controllerAs: 'searchCtrl',             resolve: { component:()=>import('~/views/bbi/management/search'),      user : currentUser() }, reloadOnSearch : false})
    .when('/platform/tools',                   { ...mapView(angularViewWrapper), controllerAs: 'toolsCtrl',              resolve: { component:()=>import('~/views/bbi/management/tools'),       user : currentUser() }})
    .when('/platform/about',                   { ...mapView(angularViewWrapper), controllerAs: 'pAboutCtrl',             resolve: { component:()=>import('~/views/bbi/management/about/index') } })
    .when('/platform/:schema',                 { ...mapView(angularViewWrapper), controllerAs: 'searchCtrl',             resolve: { component:()=>import('~/views/bbi/management/search'),      user : currentUser() }, reloadOnSearch : false})
    .when('/platform',                         { ...mapView(angularViewWrapper), controllerAs: 'pltfCtrl',               resolve: { component:()=>import('~/views/bbi/platform'), user : currentUser() } })
    .when('/about',                            { ...mapView(angularViewWrapper), controllerAs: 'initCtrl',               resolve: { component:()=>import('~/views/bbi/about/index-about')} })
    .when('/about/framework',                  { ...mapView(angularViewWrapper), controllerAs: 'frameworkCtrl',          resolve: { component:()=>import('~/views/bbi/about/framework') } })
    .when('/about/plan',                       { ...mapView(angularViewWrapper), controllerAs: 'planCtrl',               resolve: { component:()=>import('~/views/bbi/about/plan') } })
    .when('/about/partners',                   { ...mapView(angularViewWrapper), controllerAs: 'partnersCtrl',           resolve: { component:()=>import('~/views/bbi/about/partners') } })
    .when('/about/governance',                 { ...mapView(angularViewWrapper), controllerAs: 'steeringCommitteeCtrl',  resolve: { component:()=>import('~/views/bbi/about/steering-committee') } })
    .when('/about/advisory-committee',         { redirectTo: '/about/governance' })
    .when('/about/steering-committee',         { redirectTo: '/about/governance' })
    .when('/participation',                    { ...mapView(angularViewWrapper), controllerAs: 'participationCtrl',      resolve: { component:()=>import('~/views/bbi/participation/index-part') } })
    .when('/participation/request',            { ...mapView(angularViewWrapper), controllerAs: 'requestCtrl',            resolve: { component:()=>import('~/views/bbi/participation/request') } })
    .when('/participation/provide',            { ...mapView(angularViewWrapper), controllerAs: 'provideCtrl',            resolve: { component:()=>import('~/views/bbi/participation/provide') } })
    .when('/participation/opportunity',        { ...mapView(angularViewWrapper), controllerAs: 'opportunityCtrl',        resolve: { component:()=>import('~/views/bbi/participation/opportunity') } })
    .when('/projects',                         { ...mapView(angularViewWrapper), controllerAs: 'pilotCtrl',              resolve: { component:()=>import('~/views/bbi/pilot-projects/index-proj') } })
    .when('/projects/project-review-panel',    { ...mapView(angularViewWrapper), controllerAs: 'prpCtrl',                resolve: { component:()=>import('~/views/bbi/pilot-projects/project-review-panel') } })
    .when('/projects/selected',                { ...mapView(angularViewWrapper), controllerAs: 'selectedCtrl',           resolve: { component:()=>import('~/views/bbi/pilot-projects/selected') } })
    .when('/projects/completed',               { ...mapView(angularViewWrapper), controllerAs: 'completedCtrl',          resolve: { component:()=>import('~/views/bbi/pilot-projects/completed') } })
    .when('/resources',                        { ...mapView(angularViewWrapper), controllerAs: 'resoCtrl',               resolve: { component:()=>import('~/views/bbi/resources') } })
    .when('/faq',                              { ...mapView(angularViewWrapper), controllerAs: 'faqCtrl',                resolve: { component:()=>import('~/views/bbi/faq') } })
    .when('/portfolio',                        { ...mapView(angularViewWrapper), controllerAs: 'portfolioCtrl',          resolve: { component:()=>import('~/views/bbi/portfolio') } })
    .when('/contact',                          { ...mapView(angularViewWrapper), controllerAs: 'contCtrl',               resolve: { component:()=>import('~/views/bbi/contact') } })
    .when('/comms',                            { ...mapView(angularViewWrapper), controllerAs: 'commsCtrl',              resolve: { component:()=>import('~/views/bbi/comms/index-comm') } })
    .when('/search',                           { ...mapView(angularViewWrapper), controllerAs: 'searchCtrl',             resolve: { component:()=>import('~/views/bbi/management/search') }, reloadOnSearch : false})
    .when('/forums/bbi/:threadId',             { ...mapView(angularViewWrapper), resolve : { component:()=>import('~/views/bbi/forums/post-list-view'),   user : securize(['User'])}, forumId:17490, forumListUrl: '/biobridge/forums/bbi', text:'BBI'} ) //,
    .when('/forums/bbi',                       { ...mapView(angularViewWrapper), resolve : { component:()=>import('~/views/bbi/forums/thread-list-view'), user : securize(['User'])}, forumId:17490, postUrl:      '/biobridge/forums/bbi', text:'BBI'} )
    .otherwise({redirectTo: '/404'});
}]);
