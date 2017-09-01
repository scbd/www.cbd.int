define(['app', 'jquery', 'lodash', 'text!./redirect-dialog.html','providers/extended-route', 'ngRoute', 'authentication', 'ngDialog','ngCookies'], function(app, $, _,redirectDialog) {

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

        // /conferences/**
        if(/^\/conferences($|\/.*)/.test(locationPath))
            registerRoutes_conferences($routeProvider);

        // /aichi-targets/*
        if(/^\/aichi-targets($|\/.*)/.test(locationPath))
            registerRoutes_aichiTargets($routeProvider);

        // /kronos/*
        if(/^\/kronos\/list-of-participants($|\/.*)/.test(locationPath))
            registerRoutes_kronos($routeProvider);

        //bbi/*
        if(/^\/biobridge($|\/.*)/.test(locationPath))
            registerRoutes_bbi($routeProvider);

        //idb/celebrations/*
        if(/^\/idb\/celebrations($|\/.*)/.test(locationPath))
            registerRoutes_idbCelebrations($routeProvider);

        //es/*
        if(/^\/es($|\/.*)/.test(locationPath))
            registerRoutes_esPages($routeProvider);

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
      .when('/',           { template : '<div></div>', resolve: { r: function() { window.location='/conferences/2016'; } } })
      .when('/management', { templateUrl : 'views/meetings/documents/in-session/management.html', resolveController : true, resolve : { user : securize(["Administrator","EditorialService"]) } } )
      .when('/:meeting',   { templateUrl : 'views/meetings/documents/in-session/meeting-id.html', resolveController : true, progress : { stop : false } } );
    }

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_conferences(routeProvider) {

      $("base").attr('href', '/conferences/'); // allow full page reload outside of  /insession/*

      routeProvider
      .when('/',                        { redirectTo: '/2016' })
      .when('/2016',                    { templateUrl : 'views/meetings/cop13/index.html'})
      .when('/2016/cop-13-hls/documents',{templateUrl : 'views/meetings/documents/documents.html', resolveController : true, resolve: { routePrams: injectRouteParams({ meetingId: 'COP13-HLS' }), meeting: resolveLiteral('COP13-HLS') }, reloadOnSearch:false })
      .when('/2016/cop-13/documents',   { templateUrl : 'views/meetings/documents/documents.html', resolveController : true, resolve: { routePrams: injectRouteParams({ meetingId: 'COP-13'    }), meeting: resolveLiteral('COP-13')    }, reloadOnSearch:false })
      .when('/2016/cp-mop-8/documents', { templateUrl : 'views/meetings/documents/documents.html', resolveController : true, resolve: { routePrams: injectRouteParams({ meetingId: 'MOP-08'    }), meeting: resolveLiteral('MOP-08')    }, reloadOnSearch:false })
      .when('/2016/np-mop-2/documents', { templateUrl : 'views/meetings/documents/documents.html', resolveController : true, resolve: { routePrams: injectRouteParams({ meetingId: 'NP-MOP-02' }), meeting: resolveLiteral('NP-MOP-02') }, reloadOnSearch:false })
      .when('/2016/schedules',          { redirectTo: '/2016/cop-13/documents' })

      .when('/management/import-translations',     { templateUrl : 'views/meetings/documents/management/translations.html', resolveController : true, resolve : { user : securize(["Administrator","EditorialService"]) } })
      .when('/management/:meeting/documents/:id',  { templateUrl : 'views/meetings/documents/management/document-id.html',  resolveController : true, resolve : { user : securize(["Administrator","EditorialService"]) }, reloadOnSearch:false });
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
  //
  //============================================================
  function registerRoutes_idbCelebrations(routeProvider) {

      $("base").attr('href', '/idb/celebrations/'); // allow full page reload outside of  /insession/*

      routeProvider

        .when('/',  { templateUrl: 'views/idb-celebrations/idb-cel-index.html', controllerAs: 'idbProfileCtrl', resolveController: true })
        .when('/:year',       { templateUrl: 'views/idb-celebrations/idb-cel-index.html',    controllerAs: 'idbCelIndexCtrl',   resolveController: true,resolve: { routeParams: injectRouteParams({ year: '2017'    })   } })
        .when('/:year/:gov',  { templateUrl: 'views/idb-celebrations/idb-profile.html', controllerAs: 'idbProfileCtrl', resolveController: true, resolveController: true,resolve: { routeParams: injectRouteParams({ year: '2017'    })   } });

  }

  //============================================================
  //
  //
  //============================================================
  function registerRoutes_esPages(routeProvider) {

      $("base").attr('href', '/es/');

      routeProvider
        .when('/',          { templateUrl: 'views/es-pages/home.html',      resolveController: true, controllerAs: 'esHomeCtrl' })
        .when('/bio',       { templateUrl: 'views/es-pages/bio.html',       resolveController: true, controllerAs: 'esBioCtrl'  })
        .when('/work',      { templateUrl: 'views/es-pages/work.html',      resolveController: true, controllerAs: 'esWorkCtrl'  })
        .when('/media',     { templateUrl: 'views/es-pages/media.html',     resolveController: true, controllerAs: 'esMediaCtrl' })
        .when('/contact',   { templateUrl: 'views/es-pages/contact.html',   resolveController: true, controllerAs: 'esContactCtrl'  })
        .when('/video/:id',   { templateUrl: 'views/es-pages/youtube-video.html',resolveController: true, controllerAs: 'esVideoCtrl'  })
        .when('/event/:id',   { templateUrl: 'views/es-pages/event.html',resolveController: true, controllerAs: 'esEventCtrl'  })
        .when('/statement/:id',   { templateUrl: 'views/es-pages/statement.html',resolveController: true, controllerAs: 'esStatementCtrl'  });
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
    function resolveLiteral(value) {
        return function() { return value; };
    }

    //============================================================
    //
    //
    //============================================================
    function injectRouteParams(params) {
        return ['$route', function($route) {
            return _.defaults($route.current.params, params);
        }];
    }

    //============================================================
    //
    //
    //============================================================
    function registerRoutes_bbi(routeProvider) {

        $("base").attr('href', '/biobridge/'); // allow full page reload outside of  /insession/*

        routeProvider
          .when('/',                       { templateUrl: 'views/bbi/index-bbi.html',        controllerAs: 'indexCtrl',   resolveController: true })
          .when('/platform/submit/:schema',         { templateUrl: 'views/bbi/management/record-list.html',  controllerAs: 'submitCtrl',  resolveController: true,resolve : { user : securize(['User']) } })
          .when('/platform/submit/:schema/:id',     { templateUrl: 'views/bbi/management/edit.html',         controllerAs: 'editCtrl',    resolveController: true ,resolve : { user : securize(['User']) }})
          .when('/platform/submit/:schema/:id/view',{ templateUrl: 'views/bbi/management/view.html',    controllerAs: 'viewCtrl',    resolveController: true,resolve : { user : securize(['Everyone']) } })
          .when('/platform/dashboard'              ,{ templateUrl: 'views/bbi/management/index-man.html',    controllerAs: 'dashCtrl',    resolveController: true ,resolve : { user : securize(['User']) }})
          .when('/platform/search',                 { templateUrl: 'views/bbi/management/search.html',  controllerAs: 'searchCtrl',   resolveController: true, reloadOnSearch : false})
          .when('/platform/tools',                  { templateUrl: 'views/bbi/management/tools.html',  controllerAs: 'toolsCtrl',  resolveController: true,resolve : { user : securize(['Everyone']) }})
          .when('/platform/about',                  { templateUrl: 'views/bbi/management/about/index.html',  controllerAs: 'pAboutCtrl',  resolveController: true})
          .when('/platform/:schema',                       { templateUrl: 'views/bbi/management/search.html',  controllerAs: 'searchCtrl',   resolveController: true, reloadOnSearch : false})

          .when('/about',                  { templateUrl: 'views/bbi/about/index-about.html',  controllerAs: 'initCtrl',  resolveController: true})
          .when('/about/framework',        { templateUrl: 'views/bbi/about/framework.html',  controllerAs: 'frameworkCtrl',  resolveController: true})
          .when('/about/plan',             { templateUrl: 'views/bbi/about/plan.html',  controllerAs: 'planCtrl',  resolveController: true})
          .when('/about/partners',         { templateUrl: 'views/bbi/about/partners.html',  controllerAs: 'partnersCtrl',  resolveController: true})

          .when('/participation',                { templateUrl: 'views/bbi/participation/index-part.html',  controllerAs: 'participationCtrl',  resolveController: true})
          .when('/participation/request',        { templateUrl: 'views/bbi/participation/request.html',  controllerAs: 'requestCtrl',  resolveController: true})
          .when('/participation/provide',        { templateUrl: 'views/bbi/participation/provide.html',  controllerAs: 'provideCtrl',  resolveController: true})
          .when('/participation/opportunity',    { templateUrl: 'views/bbi/participation/opportunity.html',  controllerAs: 'opportunityCtrl',  resolveController: true})

          .when('/projects',                { templateUrl: 'views/bbi/pilot-projects/index-proj.html',  controllerAs: 'pilotCtrl',  resolveController: true})
          .when('/projects/selected',       { templateUrl: 'views/bbi/pilot-projects/selected.html',  controllerAs: 'selectedCtrl',  resolveController: true})


          // .when('/proposals',                     { templateUrl: 'views/bbi/search.html',  controllerAs: 'searchCtrl',  resolveController: true})

          .when('/resources',                     { templateUrl: 'views/bbi/resources.html',  controllerAs: 'resoCtrl',  resolveController: true})
          .when('/faq',                           { templateUrl: 'views/bbi/faq.html',  controllerAs: 'faqCtrl',  resolveController: true})
          .when('/contact',                       { templateUrl: 'views/bbi/contact.html',  controllerAs: 'contCtrl',  resolveController: true})

          .when('/comms',                         { templateUrl: 'views/bbi/comms/index-comm.html'    ,  controllerAs: 'commsCtrl',  resolveController: true})
          .when('/comms/panel',                   { templateUrl: 'views/bbi/comms/panel.html',  controllerAs: 'panelCtrl',   resolveController: true})
          .when('/search',                        { templateUrl: 'views/bbi/search.html',  controllerAs: 'searchCtrl',   resolveController: true, reloadOnSearch : false})
          .when('/platform',                      { templateUrl: 'views/bbi/platform.html',  controllerAs: 'pltfCtrl',   resolveController: true, resolve : { user : securize(['Everyone']) } })

          .when('/forums/bbi/:threadId',          { templateUrl: 'views/bbi/forums/post-list-view.html',  resolveController: true,resolve : { user : securize(['User'])},forumId:17490,forumListUrl:'/biobridge/forums/bbi', text:'BBI'} ) //,
          .when('/forums/bbi',                    { templateUrl: 'views/bbi/forums/thread-list-view.html',    resolveController: true,resolve : { user : securize(['User'])}, forumId:17490, postUrl:'/biobridge/forums/bbi', text:'BBI' } )

    }

    //============================================================
    //
    //
    //============================================================
    function securize(requiredRoles) {
        return ['$q', '$rootScope', 'authentication', '$location', '$window','ngDialog','$cookies', function($q, $rootScope, authentication, $location, $window,ngDialog,$cookies) {

            return $q.when(authentication.getUser()).then(function (user) {

                var hasRole = !!_.intersection(user.roles, requiredRoles).length;

                if (!user.isAuthenticated) {
                    $rootScope.authRediectChange=authRediectChange;
                    if(!!_.intersection(requiredRoles, ['Everyone']).length)
                      return user;

                    if(!$cookies.get('redirectOnAuthMsg') || $cookies.get('redirectOnAuthMsg')==='false')
                        openDialog();
                    else
                        $window.location.href = authentication.accountsBaseUrl()+'/signin?returnurl='+encodeURIComponent($location.absUrl());

                    throw user; // stop route change!
                }
                else if (!hasRole)
                    $location.url('/403?returnurl='+encodeURIComponent($location.url()));

                return user;
            });

            //============================================================
            //
            //
            //============================================================
            function openDialog() {
                $rootScope.redirectOnAuthMsg=false;
                $cookies.put('redirectOnAuthMsg',false,{path:'/',expires:new Date(new Date().setFullYear(new Date().getFullYear() + 1))});
                ngDialog.open({
                      template: redirectDialog,
                      className: 'ngdialog-theme-default',
                      closeByDocument: false,
                      plain: true,
                      scope:$rootScope
                  }).closePromise.then(function(retVal){
                        if(retVal.value)
                          $window.location.href = authentication.accountsBaseUrl()+'/signin?returnurl='+encodeURIComponent($location.absUrl());
                        else
                          $window.history.back();
                  });
            }
            //============================================================
            //
            //
            //============================================================
            function authRediectChange(value) {
                $cookies.put('redirectOnAuthMsg',value,{path:'/',expires:new Date(new Date().setFullYear(new Date().getFullYear() + 1))});
            }//authRediectChange

        }];//return array
    }//securize

});
