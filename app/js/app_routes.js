'use strict';

define(['app', 'extended-route-provider'], function(app) {

  app.config(['extendedRouteProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {

      var prefix = '/reports';

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider
        .when(prefix + '/', {
          templateUrl: '/app/views/index.html',
          resolveController: true,
          resolveUser: true
        })
        .when('/about', {
          templateUrl: '/app/views/about.html',
          resolveUser: true
        })
        .when('/cms/management/papersmart.shtml', {
          templateUrl: '/app/views/samples/country-index.html',
          resolveController: true,
          resolveUser: true
        })
        .when('/cms/management/papersmart.shtml/:country', {
          templateUrl: '/app/views/samples/country.html',
          resolveController: true,
          resolveUser: true
        })
        .when('/case-studies/:id', {
          templateUrl: '/app/views/samples/case-study.html',
          resolveController: true,
          resolveUser: true
        })
        .when('/404', {
          templateUrl: '/app/views/404.html',
          resolveUser: true
        })
        .otherwise({
          redirectTo: '/404'
        });
    }
  ]);

});