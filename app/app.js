import angular from 'angular'
import 'toastr'
import { 
  AngularVueRouterPlugin, 
  AngularVueRoutePlugin, 
  AngularVuePlugin,
  AngularVueDirective,
  AngularVueAuthPlugin
} from 'angular-vue';

const app = angular.module('app', angular.defineModules(
         ['ngRoute', 'ngCookies', 'ngDialog', 'ngSanitize','infinite-scroll','smoothScroll','toastr','ngVue', 'angular-cache', 'angularVue', 'angularGrid']));


    app.provider('$ngVue', $ngVueProvider) // create own ngVue provider as theirs was broken
        
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
          progressBar: false,
        });
        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('flexHttpInterceptor');
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
        $httpProvider.interceptors.push('apiRebase'); //should be last interceptor

        app.$httpProvider = $httpProvider;
    }]);

  app.config(['$sceDelegateProvider', function($sceDelegateProvider){

    $sceDelegateProvider.resourceUrlWhitelist([
      'self', // Allow same origin resource loads.
      'https://*.cbd.int/**' // Allow loading from cbd.int domain;
    ]);
  }])

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
    
	app.provider('flexHttpInterceptor', [function() { // TODO Move to anfularFlex

        var fatoryInterceptors = [];

        this.interceptors = fatoryInterceptors,

		this.$get = ["$q", "$injector", function($q, $injector) {

            return {

                request: function(config) {

                    if(fatoryInterceptors.length===0)
                        return config;

                    var interceptors = fatoryInterceptors.concat(); // clone

                    var q = $q.when(config);

                    for(var i in interceptors) {

                        var interceptor = $injector.get(interceptors[i]);

                        if(interceptor.request)
                            q = $q.when(q.then(interceptor.request));
                    }

                    return q;
                }
            };
        }];
    }]);

  app.value("captchaSiteKeyV2", (document && document.documentElement.attributes['captcha-site-key-v2'].value));
  app.value("captchaSiteKeyV3", (document && document.documentElement.attributes['captcha-site-key-v3'].value));
  
  function $ngVueProvider() {
    var inQuirkMode = false
    var rootProps = {}
    this.setRootVueInstanceProps = function (props) {
      _.assign(rootProps, props)
    }
    this.$get=function(){
      return {
        getRootProps: function(){ return rootProps},
        inQuirkMode: function(){ return inQuirkMode}
      }
    }
  }

  app.directive('ngVue', AngularVueDirective);

  app.run(["$injector", "authentication", 'locale', function($injector, authentication, locale) {

    var i18n = new window.VueI18n({
      locale        : locale,
      fallbackLocale: 'en',
    })
    window.Vue.use(i18n)

    const vueRootApp = new Vue({i18n});

    window.Vue.use(new AngularVuePlugin({ $injector, ngApp: app, vueApp: vueRootApp }));
    window.Vue.use(new AngularVueRoutePlugin());
    window.Vue.use(new AngularVueRouterPlugin());
    window.Vue.use(new AngularVueAuthPlugin({
      fetchUser() { return authentication.getUser(); },
      logout()    { return authentication.signOut()},
      async login() {}
    }));

  window.locale = locale;

  }]);


export default app;