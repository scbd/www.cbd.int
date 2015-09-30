define([
    'angular',
    'ngRoute',
    'ngCookies',
    'angular-growl',
    'angularMoment',
    'ngAnimate',
    'bootstrap',
    'directives/ui-bootstrap-custom'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngCookies', 'ngAnimate','angular-growl', 'angularMoment', 'ui.bootstrap'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);

    app.config(['$httpProvider', 'growlProvider', function($httpProvider, growlProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');

        growlProvider.globalTimeToLive(7000);
        growlProvider.globalEnableHtml(false);
    }]);

    return app;
});
