define(['app', 'jquery', 'providers/extended-route', 'ngRoute'], function(app, $) { 'use strict';

    var locationPath = window.location.pathname.toLowerCase().split('?')[0];

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        // /decisions/*
        if(/^\/decisions($|\/.*)/.test(locationPath))
        {
            $("base").attr('href', '/decisions/'); // allow full page reload outside of  /decisions/*

            $routeProvider.when('/x', { templateUrl: 'views/decisions/index.html', resolveController: true });
        }

        // /insession/*
        if(/^\/insession($|\/.*)/.test(locationPath))
        {
            $("base").attr('href', '/insession/'); // allow full page reload outside of  /insession/*

            $routeProvider.when('/',  {
                templateUrl : 'views/meetings/documents/in-session-index.html'
            }).when('/mop7',  {
                templateUrl : 'views/meetings/documents/in-session.html',
                resolveController : true,
                progress  : { stop : false },
                title     : "BS COP-MOP 7 In-session Documents",
                intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
                documents : {
                    plenary       : { title : "Plenary", open : true, url : "/doc/meetings/bs/mop-07/insession/src/plenary.json" },
                }
            }).when('/npmop1',  {
                templateUrl : 'views/meetings/documents/in-session.html',
                resolveController : true,
                progress  : { stop : false },
                title     : "NP COP-MOP 1 In-session Documents",
                intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
                documents : {
                    plenary       : { title : "Plenary", open : true, url : "/doc/meetings/abs/np-mop-01/insession/src/plenary.json" }
                }
            }).when('/cop12/hls',  {
                templateUrl : 'views/meetings/documents/in-session.html',
                resolveController : true,
                progress  : { stop : false },
                title     : "High Level Segment of COP 12",
                intro     : "The CBD Secretariat is making the following documents available on behalf of the Government of the Republic of Korea.",
                documents : {
                    plenary     : { title : "HLS Documents",                                                                          open : true, url : "/doc/meetings/cop/cop-12/insession/hls/src/plenary.json" },
                    initiatives : { title : "COP 12 Information documents on Initiatives of the Government of the Republic of Korea", open : true, url : "/doc/meetings/cop/cop-12/insession/hls/src/initiatives.json" }
                }
            }).when('/cop12',  {
                templateUrl : 'views/meetings/documents/in-session.html',
                resolveController : true,
                progress  : { stop : false },
                title     : "COP 12 In-Session Documents",
                intro     : "The documents below are in session documents made available for the convenience of the participants. They do not represent final decisions.",
                documents : {
                    plenary       : { title : "Plenary", open : true, url : "/doc/meetings/cop/cop-12/insession/src/plenary.json" }
                }
            });
        }

        $routeProvider.when('/404', { templateUrl: '/app/views/404.html', resolveUser: true }).otherwise({redirectTo: '/404'});
    }
  ]);
});
