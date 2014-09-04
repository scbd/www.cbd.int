define([
  'angular',
  'angular-route',
  'angular-cookies',
  'angular-growl',
  'angular-moment',
  'angular-animate',
  'bootstrap',
  'text',
  '/app/directives/ui-bootstrap-custom.js'], function(angular) { 'use strict';

  var app = angular.module('app', ['ngRoute', 'ngCookies', 'ngAnimate','angular-growl', 'angularMoment', 'ui.bootstrap']);

  app.config(['$controllerProvider', '$compileProvider', '$provide', '$filterProvider', 'growlProvider',
    function($controllerProvider, $compileProvider, $provide, $filterProvider, growlProvider) {

      // Allow dynamic registration

      app.filter     = $filterProvider.register;
      app.factory    = $provide.factory;
      app.value      = $provide.value;
      app.controller = $controllerProvider.register;
      app.directive  = $compileProvider.directive;

      growlProvider.globalTimeToLive(7000);
      growlProvider.globalEnableHtml(false);

    }
  ]);

  return app;
});
