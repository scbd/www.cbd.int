define(['app', 'js/providers/routes/extended-route-provider'], function(app) { 'use strict';

  app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when('/printsmart/printshop',       {templateUrl: '/app/views/print-smart/printshop.html',  resolveController: true })

        .when('/mop7/insession',  {
            templateUrl : '/app/views/meetings/documents/in-session.html',
            resolveController : true,
            progress  : { stop : false },
            title     : "BS COP-MOP 7 In-session Documents",
            intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
            documents : {
                plenary       : { title : "Plenary", open : true, url : "/doc/meetings/bs/mop-07/insession/src/plenary.json" },
            }
        }).when('/npmop1/insession',  {
            templateUrl : '/app/views/meetings/documents/in-session.html',
            resolveController : true,
            progress  : { stop : false },
            title     : "NP COP-MOP 1 In-session Documents",
            intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
            documents : {
                plenary       : { title : "Plenary", open : true, url : "/doc/meetings/abs/np-mop-01/insession/src/plenary.json" }
            }
        }).when('/cop12/insession',  {
            templateUrl : '/app/views/meetings/documents/in-session.html',
            resolveController : true,
            progress  : { stop : false },
            title     : "COP 12 In-Session Documents",
            intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
            documents : {
                plenary       : { title : "Plenary", open : true, url : "/doc/meetings/cop/cop-12/insession/src/plenary.json" }
            }
        }).when('/cop12/insession/hls',  {
            templateUrl : '/app/views/meetings/documents/in-session.html',
            resolveController : true,
            progress  : { stop : false },
            title     : "High Level Segment of COP 12",
            intro     : "The CBD Secretariat is making the following documents available on behalf of the Government of the Republic of Korea.",
            documents : {
                plenary     : { title : "HLS Documents",                                                                          open : true, url : "/doc/meetings/cop/cop-12/insession/hls/src/plenary.json" },
                initiatives : { title : "COP 12 Information documents on Initiatives of the Government of the Republic of Korea", open : true, url : "/doc/meetings/cop/cop-12/insession/hls/src/initiatives.json" }
            }
        })

        .when('/404', {templateUrl: '/app/views/404.html', resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
