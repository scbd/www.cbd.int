define(['app', 'providers/routes/extended-route-provider'], function(app) { 'use strict';

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
                plenary       : { title : "Plenary",                           url : "/doc/no-cache/mop7/insession/plenary.json" },
                wg1           : { title : "Working Group I",                   url : "/doc/no-cache/mop7/insession/wg1.json", tag : "WG.1" },
                wg2           : { title : "Working Group II",                  url : "/doc/no-cache/mop7/insession/wg2.json", tag : "WG.2" },
                other         : { title : "Other",                             url : "/doc/no-cache/mop7/insession/other.json" },
                presentations : { title : "Special Session on Implementation", url : "/doc/no-cache/mop7/insession/presentations.json" }
            }
        }).when('/npmop1/insession',  {
            templateUrl : '/app/views/meetings/documents/in-session.html',
            resolveController : true,
            progress  : { stop : false },
            title     : "NP COP-MOP 1 In-session Documents",
            intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
            documents : {
                plenary       : { title : "Plenary",          url : "/doc/no-cache/npmop1/insession/plenary.json" },
                wg1           : { title : "Working Group I",  url : "/doc/no-cache/npmop1/insession/wg1.json", tag : "WG.1" },
                wg2           : { title : "Working Group II", url : "/doc/no-cache/npmop1/insession/wg2.json", tag : "WG.2" },
                restricted    : { title : "Non-Papers",       url : "/doc/no-cache/npmop1/insession/restricted.json" },
                other         : { title : "Other",            url : "/doc/no-cache/npmop1/insession/other.json" }
            }
        }).when('/cop12/insession',  {
            templateUrl : '/app/views/meetings/documents/in-session.html',
            resolveController : true,
            progress  : { stop : false },
            title     : "COP 12 In-Session Documents",
            intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
            documents : {
                plenary       : { title : "Plenary",          url : "/doc/no-cache/cop12/insession/plenary.json" },
                wg1           : { title : "Working Group I",  url : "/doc/no-cache/cop12/insession/wg1.json", tag : "WG.1" },
                wg2           : { title : "Working Group II", url : "/doc/no-cache/cop12/insession/wg2.json", tag : "WG.2" },
                restricted    : { title : "Non-Papers",       url : "/doc/no-cache/cop12/insession/restricted.json" },
                other         : { title : "Other",            url : "/doc/no-cache/cop12/insession/other.json" }
            }
        }).when('/cop12/insession/hls',  {
            templateUrl : '/app/views/meetings/documents/in-session.html',
            resolveController : true,
            progress  : { stop : false },
            title     : "High Level Segment of COP 12",
            intro     : "The CBD Secretariat is making the following documents available on behalf of the Government of the Republic of Korea.",
            documents : {
                plenary     : { title : "HLS Documents",                                                                          open : true, url : "/doc/no-cache/cop12/insession/hls/plenary.json" },
                initiatives : { title : "COP 12 Information documents on Initiatives of the Government of the Republic of Korea", open : true, url : "/doc/no-cache/cop12/insession/hls/initiatives.json" }
            }
        })

        .when('/404', {templateUrl: '/app/views/404.html', resolveUser: true })
        .otherwise({redirectTo: '/404'});
    }
  ]);
});
