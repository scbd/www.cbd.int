define(['angular', 'ngSanitize','toastr','hl.sticky'], function(angular) { 'use strict';

    var app = angular.module('app', angular.defineModules(['ngRoute', 'ngCookies', 'ngDialog', 'ngSanitize','infinite-scroll','smoothScroll','toastr','hl.sticky']));

    app.config(['$httpProvider','toastrConfig', function($httpProvider,toastrConfig) {
        angular.extend(toastrConfig, {
          autoDismiss: true,
          containerId: 'toast-container',
          newestOnTop: true,
          closeButton: true,
          positionClass: 'toast-top-right',
          iconClasses: {
            error: 'alert-danger',
            info: 't-info',
            success: 'alert-success',
            warning: 'alert-warning'
          },
          target: 'body',
          timeOut: 5000,
          progressBar: true,
        });
        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
        $httpProvider.interceptors.push('apiRebase'); //should be last interceptor        
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
