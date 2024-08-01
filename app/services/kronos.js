import app from '~/app';
import ng from 'angular';
    

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

        this.$get = ['$location','$http', function($location,$http) {

            var domain = $location.host();

            var baseUrl = "https://kronos.cbd.int";

            if(/cbddev\.xyz$/i.test(domain)) baseUrl = "https://kronos.cbddev.xyz";
            if(/localhost$/i  .test(domain)) baseUrl = "https://kronos.cbd.int";
            if(/local$/i      .test(domain)) baseUrl = "https://kronos.cbddev.xyz";

			async function createPassport (contactId, conferenceId, passportInfo) {
				if (!contactId) throw Error('contactId required');
				if (!conferenceId) throw Error('conferenceId required');
				if (!passportInfo) throw Error('passportInfo');
			
			
			
			
				const data = await $http.post(`${baseUrl}/api/v2018/passports`,  { ...passportInfo, contactId, conferenceId })
			
				return data;
			  }

            return {
                baseUrl , createPassport 
            }
        }];
    }]);

