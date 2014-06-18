'use strict';

define(['app', 'extended-route-provider'], function(app) {

  app.config(['extendedRouteProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/internal/printsmart',                      {templateUrl: '/app/views/print-smart/index.html',     resolveController: true })
        .when('/internal/printsmart/:badge',               {templateUrl: '/app/views/print-smart/index-id.html',  resolveController: true })
        .when('/national-reports',                         {templateUrl: '/app/views/reports/reports.html',       resolveController: true, resolveUser: true })
        .when('/about',                                    {templateUrl: '/app/views/about.html',                 resolveUser: true })
        .when('/cms/management/papersmart.shtml',          {templateUrl: '/app/views/samples/country-index.html', resolveController: true, resolveUser: true })
        .when('/cms/management/papersmart.shtml/:country', {templateUrl: '/app/views/samples/country.html',       resolveController: true, resolveUser: true })
        .when('/case-studies/:id',                         {templateUrl: '/app/views/samples/case-study.html',    resolveController: true, resolveUser: true })
        .when('/404',                                      {templateUrl: '/app/views/404.html',                   resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);

});