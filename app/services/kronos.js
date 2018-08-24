define(['app', 'angular'], function(app, ng) {
    'use strict';

	app.factory('kronosHttpIntercepter', ["$q", "apiToken", "kronos", function($q, apiToken, kronos) {

		return {
			request: function(config) {

				var trusted = config.url.indexOf(kronos.baseUrl+'/')===0;

				var hasAuthorization = (config.headers||{}).hasOwnProperty('Authorization') ||
							  		   (config.headers||{}).hasOwnProperty('authorization');

				if(!trusted || hasAuthorization) // no need to alter config
					return config;

				//Add token to http headers

				return $q.when(apiToken.getCookieToken()).then(function(token) {

					if(token) {
						config.headers = ng.extend(config.headers||{}, {
							Authorization : "Ticket " + token
						});
					}

					return config;
				});
			}
		};
	}]);

    app.provider('kronos', ['flexHttpInterceptorProvider', function(flexHttpInterceptorProvider) {

        flexHttpInterceptorProvider.interceptors.push('kronosHttpIntercepter');

        this.$get = ['$location', function($location) {

            var domain = $location.host();

            var baseUrl = "https://kronos.cbd.int";

            if(/cbddev\.xyz$/i.test(domain)) baseUrl = "https://kronos.cbddev.xyz";
            if(/localhost$/i  .test(domain)) baseUrl = "http://bilodeaux7.local";
            if(/local$/i      .test(domain)) baseUrl = "http://bilodeaux7.local";

            return {
                baseUrl : baseUrl
            }
        }];
    }]);
});