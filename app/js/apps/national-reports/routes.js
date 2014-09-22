define(['app', 'providers/routes/extended-route-provider'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/reports/map',                              {templateUrl: '/app/views/reports/reports.html',       resolveController: true, resolveUser: true })
        .when('/about',                                    {templateUrl: '/app/views/about.html',                 resolveUser: true })
        .when('/case-studies/:id',                         {templateUrl: '/app/views/samples/case-study.html',    resolveController: true, resolveUser: true })
        .when('/404',                                      {templateUrl: '/app/views/404.html',                   resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
