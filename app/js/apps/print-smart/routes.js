define(['app', 'providers/routes/extended-route-provider'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/printsmart',                      {templateUrl: '/app/views/print-smart/index.html',     resolveController: true })
        .when('/printsmart/statistics',           {templateUrl: '/app/views/print-smart/stats.html',     resolveController: true })
        .when('/printsmart/printshop',            {templateUrl: '/app/views/print-smart/printshop.html',  resolveController: true })
        .when('/printsmart/authorization',        {templateUrl: '/app/views/print-smart/authorization.html',  resolveController: true })
        .when('/printsmart/:badge',               {templateUrl: '/app/views/print-smart/index-id.html',  resolveController: true })
        .when('/404',                                      {templateUrl: '/app/views/404.html',                   resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
