define(['app', 'angular'], function (app, angular) { 'use strict';

    app.provider("realm", {

        $get : ["$location", function($location) {

            if($location.$$host!= "www.cbd.int"){
                return 'CHM-DEV';
            }
            return 'CHM';
        }]
    });

    app.factory('realmHttpIntercepter', ['realm', function(realm) {

		return {
			request: function(config) {

               if((config.headers || {}).hasOwnProperty('realm'))
                   return config;

				       var trusted = /^https:\/\/api.cbd.int\//i .test(config.url) ||
						      /^https:\/\/localhost[:\/]/i.test(config.url) ||
							    /^\/\w+/i                   .test(config.url);

                //exception if the APi call needs to be done for different realm
                if (trusted && realm) {
                       config.headers = angular.extend(config.headers || {}, {
                           realm: realm.value || realm
                       });
                }

                return config;
			}
		};
	}]);

}); //define