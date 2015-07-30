define(['angular', 'angular-route', 'angular-cookies', 'angular-growl', 'bootstrap'], function(angular) { 'use strict';

    var app = angular.module('app', ['ngRoute', 'ngCookies', 'angular-growl']);

    app.config(['$controllerProvider', '$compileProvider', '$provide', '$filterProvider', 'growlProvider',
      function(  $controllerProvider,   $compileProvider,   $provide,   $filterProvider,   growlProvider) {

        // Allow dynamic registration

        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.value      = $provide.value;
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;

        growlProvider.globalTimeToLive(5000);
        growlProvider.globalEnableHtml(false);
    }]);

    return app;
});
