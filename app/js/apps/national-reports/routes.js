define(['app', 'providers/extended-route'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

       //base = "/reports/map"

      $routeProvider
        .when('/',     { templateUrl: 'views/reports/reports.html',       resolveController: true , reloadOnSearch : false})
        .when('/404',  { templateUrl: 'views/404.html',                   })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
