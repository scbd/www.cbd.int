define([
    'angular',
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'bootstrap'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngCookies'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);

    app.config(['$httpProvider', function($httpProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
    }]);

    return app;
});
