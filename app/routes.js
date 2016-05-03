define(['app', 'jquery', 'underscore', 'providers/extended-route', 'ngRoute', 'authentication'], function(app, $, _) { 'use strict';

    var locationPath = window.location.pathname.toLowerCase().split('?')[0];

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        // /decisions/*
        if(/^\/decisions($|\/.*)/.test(locationPath))
            registerRoutes_Decisions($routeProvider);

        // /management/decisions/*
        if(/^\/management\/decisions($|\/.*)/.test(locationPath))
            registerRoutes_Decisions($routeProvider);

        // /insession/*
        if(/^\/insession($|\/.*)/.test(locationPath))
            registerRoutes_insession($routeProvider);

        // /schedule/*
        if(/^\/schedules($|\/.*)/.test(locationPath))
            registerRoutes_schedules($routeProvider);

        $routeProvider.when('/404', { templateUrl: '/app/views/404.html', resolveUser: true }).otherwise({redirectTo: '/404'});
    }
  ]);

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_Decisions(routeProvider) {

      $('base').attr('href', '/decisions/'); // allow full page reload outside of  /decisions/*

      //routeProvider.when('/cop', { templateUrl: 'views/decisions/search.html', resolveController: true });
      routeProvider.when('/cop/:session', { templateUrl: 'views/decisions/list.html', resolveController: true });
      routeProvider.when('/cop/:session/:element', { templateUrl: 'views/decisions/view.html', resolveController: true });
      //routeProvider.when('/', { templateUrl: 'views/decisions/search.html', resolveController: true });
  }

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_ManagementDecisions(routeProvider) {

      $("base").attr('href', '/management/decisions/'); // allow full page reload outside of  /decisions/*

      routeProvider.when('/', { templateUrl: 'views/decisions/index.html', resolveController: true });
      routeProvider.when('/:meeting/:number', { templateUrl: 'views/decisions/edit.html', resolveController: true });
  }

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_insession(routeProvider) {

      $("base").attr('href', '/insession/'); // allow full page reload outside of  /insession/*

      routeProvider
      .when('/',           { templateUrl : 'views/meetings/documents/in-session/index.html',      resolveController : true})
      .when('/management', { templateUrl : 'views/meetings/documents/in-session/management.html', resolveController : true, resolve : { user : securize(["Administrator","EditorialService"]) } } )
      .when('/:meeting',   { templateUrl : 'views/meetings/documents/in-session/meeting-id.html', resolveController : true, progress : { stop : false } } );
    }

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_schedules(routeProvider) {

      $("base").attr('href', '/schedules/'); // allow full page reload outside of  /insession/*

      routeProvider
          .when('/:streamId?',       { templateUrl: 'views/schedules/index-id.html', controllerAs: 'indexIdCtrl', resolveController: true, progress : { stop : false } });
  }
    //============================================================
    //
    //
    //============================================================
    function securize(requiredRoles) {
        return ['$q', '$rootScope', 'authentication', '$location', '$window', function($q, $rootScope, authentication, $location, $window) {

            return $q.when(authentication.getUser()).then(function (user) {

                var hasRole = !!_.intersection(user.roles, requiredRoles).length;

                if (!user.isAuthenticated) {
                    $window.location.href = 'https://accounts.cbd.int/signin?returnurl='+encodeURIComponent($location.absUrl());
                    throw user; // stop route change!
                }
                else if (!hasRole)
                    $location.url('/403?returnurl='+encodeURIComponent($location.url()));

                return user;
            });
        }];
    }
});
