define(['app', 'providers/routes/extended-route-provider'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/npmop1/insession',           {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, progress : { stop : false }, title : "NP COP-MOP 1 In In-session Documents", documentsUrl : "/doc/no-cache/npmop1/insession/" })
        .when('/mop7/insession',             {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, progress : { stop : false }, title : "BS COP-MOP 7 In-session Documents",    documentsUrl : "/doc/no-cache/mop7/insession/"   })
        .when('/cop12/insession',            {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, progress : { stop : false }, title : "COP 12 In-Session Documents",          documentsUrl : "/doc/no-cache/cop12/insession/"  })

        .when('/printsmart/printshop',       {templateUrl: '/app/views/print-smart/printshop.html',  resolveController: true })
        .when('/404',                        {templateUrl: '/app/views/404.html',                   resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
