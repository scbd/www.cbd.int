define(['app', 'providers/routes/extended-route-provider'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/npmop1/doc/insession',           {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, documentsUrl : "/doc/meetings/abs/np-mop-01/insession/documents.json" })
        .when('/mop7/doc/insession',             {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, documentsUrl : "/doc/meetings/bs/mop-07/insession/documents.json" })
        .when('/cop12/doc/insession',            {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, documentsUrl : "/doc/meetings/cop/cop-12/insession/documents.json" })

        .when('/cms/management/ps.shtml',        {templateUrl: '/app/views/meetings/documents/in-session.html',  resolveController: true, documentsUrl : "/doc/meetings/bs/mop-07/insession/documents.json" })

        .when('/internal/printsmart/printshop',  {templateUrl: '/app/views/print-smart/printshop.html',  resolveController: true })
        .when('/404',                            {templateUrl: '/app/views/404.html',                   resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
