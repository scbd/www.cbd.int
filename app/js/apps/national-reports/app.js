define([
    'angular',
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'bootstrap',
    'directives/ui-bootstrap-custom'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngCookies', 'ngAnimate', 'ui.bootstrap'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);

    app.config(['$httpProvider', function($httpProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
    }]);

    return app;
});
