'use strict';

define([
  'angular',
  'angular-growl',
  '/app/directives/index.js',
  '/app/services/index.js',
  '/app/filters/index.js'
], function(angular) {

  var app = angular.module('app', ['ngRoute', 'ngCookies', 'angular-growl', 'app.services', 'app.directives', 'app.filters', 'ui.bootstrap']);

  app.config(['$controllerProvider', '$compileProvider', '$provide', '$filterProvider', 'growlProvider',
    function($controllerProvider, $compileProvider, $provide, $filterProvider, growlProvider) {

      // Allow dynamic registration

      app.filter = $filterProvider.register;
      app.factory = $provide.factory;
      app.value = $provide.value;
      app.controller = $controllerProvider.register;
      app.directive = $compileProvider.directive;

      growlProvider.globalTimeToLive(10000);

    }
  ]);

  return app;
});