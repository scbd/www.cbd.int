define(['app', 'providers/routes/extended-route-provider'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/npmop1/insession',           {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, progress : { stop : false }, title : "NP COP-MOP 1 In In-session Documents", documentsUrl : "/doc/meetings/abs/np-mop-01/insession/documents.js" })
        .when('/mop7/insession',             {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, progress : { stop : false }, title : "BS COP-MOP 7 In-session Documents",    documentsUrl : "/doc/meetings/bs/mop-07/insession/documents.js" })
        .when('/cop12/insession',            {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, progress : { stop : false }, title : "COP 12 In-Session Documents",          documentsUrl : "/doc/meetings/cop/cop-12/insession/documents.js" })

        .when('/printsmart/ps6d7wgr67ewfgr6dq7gr23786rgd78r6',        {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, title : "TEST In Session Documents", documentsUrl : "/doc/meetings/bs/mop-07/insession/test-documents.js", progress : { stop : false } })

        .when('/printsmart/printshop',  {templateUrl: '/app/views/print-smart/printshop.html',  resolveController: true })
        .when('/404',                            {templateUrl: '/app/views/404.html',                   resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
