define(['angular', 'angular-route', 'angular-cookies', 'bootstrap'], function(angular) { 'use strict';

    var app = angular.module('app', ['ngRoute', 'ngCookies']);

    app.config(['$controllerProvider', '$compileProvider', '$provide', '$filterProvider',
      function(  $controllerProvider,   $compileProvider,   $provide,   $filterProvider) {

        // Allow dynamic registration

        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.value      = $provide.value;
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;

    }]);

    return app;
});
