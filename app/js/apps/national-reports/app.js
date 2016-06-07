define([
    'angular',
    'ngRoute',
    'ngCookies',
    'angularMoment',
    'ngAnimate',
    'bootstrap',
    'directives/ui-bootstrap-custom'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngCookies', 'ngAnimate', 'angularMoment', 'ui.bootstrap'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);

    app.config(['$httpProvider', function($httpProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
    }]);

    return app;
});
