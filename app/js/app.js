'use strict';

define([
  'angular',
  'angular-growl',
  'angular-moment',
  '/app/directives/ui-bootstrap-custom.js'
], function(angular) {
  
  var app = angular.module('app', ['ngRoute', 'ngCookies', 'angular-growl', 'angularMoment', 'ui.bootstrap']);

  app.config(['$controllerProvider', '$compileProvider', '$provide', '$filterProvider', 'growlProvider',
    function($controllerProvider, $compileProvider, $provide, $filterProvider, growlProvider) {

      // Allow dynamic registration

      app.filter     = $filterProvider.register;
      app.factory    = $provide.factory;
      app.value      = $provide.value;
      app.controller = $controllerProvider.register;
      app.directive  = $compileProvider.directive;

      growlProvider.globalTimeToLive(10000);

    }
  ]);

  return app;
});