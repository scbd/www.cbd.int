define(['angular', 'ngSanitize'], function(angular) { 'use strict';

    var app = angular.module('app', angular.defineModules(['ngRoute', 'ngCookies', 'ngDialog', 'ngSanitize']));

    app.config(['$httpProvider', function($httpProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('apiRebase');

    }]);

	app.factory('apiRebase', ["$location", function($location) {

		return {
			request: function(config) {

                var rewrite = config  .url   .toLowerCase().indexOf('/api/')===0 &&
                             $location.host().toLowerCase() == 'www.cbd.int';

				if(rewrite)
                    config.url = 'https://api.cbd.int' + config.url;

				return config;
			}
		};
	}]);

    return app;
});
