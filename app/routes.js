define(['app', 'jquery', 'underscore', 'providers/extended-route', 'ngRoute', 'authentication'], function(app, $, _) { 'use strict';

    var locationPath = window.location.pathname.toLowerCase().split('?')[0];

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        // /decisions/cop/*
        if(/^\/decisions\/cop($|\/.*)/.test(locationPath))
            registerRoutes_CopDecisions($routeProvider);

        // /management/decisions/*
        if(/^\/management\/decisions($|\/.*)/.test(locationPath))
            registerRoutes_ManagementDecisions($routeProvider);

        // /insession/*
        if(/^\/insession($|\/.*)/.test(locationPath))
            registerRoutes_insession($routeProvider);

        // /schedule/*
        if(/^\/schedules($|\/.*)/.test(locationPath))
            registerRoutes_schedules($routeProvider);

        // /aichi-targets/*
        if(/^\/aichi-targets($|\/.*)/.test(locationPath))
            registerRoutes_aichiTargets($routeProvider);

        // /kronos/*
        if(/^\/kronos\/list-of-participants($|\/.*)/.test(locationPath))
            registerRoutes_kronos($routeProvider);

        $routeProvider.when('/403', { templateUrl: '/app/views/403.html' });
        $routeProvider.when('/404', { templateUrl: '/app/views/404.html' }).otherwise({redirectTo: '/404'});
    }
  ]);

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_CopDecisions(routeProvider) {

      $('base').attr('href', '/decisions/cop/'); // allow full page reload outside of  /decisions/*

      //routeProvider.when('/cop', { templateUrl: 'views/decisions/search.html', resolveController: true });
      routeProvider.when('/:session',                      { templateUrl: 'views/decisions/list.html', resolveController: true });
      routeProvider.when('/:session/:decision',            { templateUrl: 'views/decisions/view.html', resolveController: true });
      routeProvider.when('/:session/:decision/:paragraph', { templateUrl: 'views/decisions/paragraph.html', resolveController: true });
      //routeProvider.when('/', { templateUrl: 'views/decisions/search.html', resolveController: true });
  }

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_ManagementDecisions(routeProvider) {

      $("base").attr('href', '/management/decisions/'); // allow full page reload outside of  /decisions/*

      routeProvider.when('/',                 { templateUrl: 'views/decisions/index.html', resolveController: true, resolve : { user : securize(["Administrator","DecisionTrackingTool"]) } } );
      routeProvider.when('/:meeting/:number', { templateUrl: 'views/decisions/edit.html',  resolveController: true, resolve : { user : securize(["Administrator","DecisionTrackingTool"]) } } );
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
  function registerRoutes_aichiTargets(routeProvider) {

      $("base").attr('href', '/aichi-targets/'); // allow full page reload outside of  /insession/*

      routeProvider
        .when('/',                  { templateUrl: 'views/aichi-targets/index.html',    controllerAs: 'indexCtrl',   resolveController: true })
        .when('/target/:targetId',  { templateUrl: 'views/aichi-targets/index-id.html', controllerAs: 'indexIdCtrl', resolveController: true });
  }

  //============================================================
  //
  //s
  //============================================================
  function registerRoutes_kronos(routeProvider) {

      $("base").attr('href', '/kronos/list-of-participants/'); // allow full page reload outside of  /insession/*

      routeProvider
        .when('/',                  { templateUrl: 'views/meetings/participants/index.html',    controllerAs: 'indexCtrl',   resolveController: true, resolve: { user : securize(["Administrator","KronosAdministrator", "ScbdStaff"]) }  });
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
