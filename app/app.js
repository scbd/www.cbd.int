define(['angular', 'ngSanitize'], function(angular) { 'use strict';

    var app = angular.module('app', angular.defineModules(['ngRoute', 'ngCookies', 'ngDialog', 'ngSanitize']));

    app.config(['$httpProvider', function($httpProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');

    }]);

    return app;
});
