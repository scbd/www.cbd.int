define(['app', 'providers/routes/extended-route-provider'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/cms/management/ps.shtml',           {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true })
        .when('/internal/printsmart/printshop',     {templateUrl: '/app/views/print-smart/printshop.html',  resolveController: true })
        .when('/404',                               {templateUrl: '/app/views/404.html',                   resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
