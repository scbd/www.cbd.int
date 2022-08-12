import '~/authentication'
import 'ngDialog'
import _ from 'lodash'
import redirectDialog from '../redirect-dialog.html'
import '~/providers/locale'
import { CreateAngularVuePlainPlugin, AngularVueRoutePlugin, AngularVueRouterPlugin } from 'angular-vue-plugins';
import app from '~/app';

//============================================================
//
//============================================================
export function mapView(comp) {

    const template   = comp.template;
    const controller = comp.default;

    return { template, controller }
}
//============================================================
//
//============================================================
export function resolveLiteral(value) {
    return function () { return value; };
}

//============================================================
//
//============================================================
export function injectRouteParams(params) {
    return ['$route', function ($route) {
        return _.defaults($route.current.params, params);
    }];
}

//============================================================
//
//============================================================
export function currentUser() {
    return ['$q', 'authentication', function ($q, authentication) {
        return $q.when(authentication.getUser())
        .then((user)=>{

            if(Vue?.prototype.$auth)
                Vue.prototype.$auth.setUser(user);

            return user;
        });
    }];
}

//============================================================
//
//============================================================
export function securize(requiredRoles) {
    return ['$q', '$rootScope', 'authentication', '$location', '$window', 'ngDialog', '$cookies', function ($q, $rootScope, authentication, $location, $window, ngDialog, $cookies) {

        return $q.when(authentication.getUser()).then(function (user) {

            var hasRole = !!_.intersection(user.roles, requiredRoles).length;

            if (!user.isAuthenticated) {
                $rootScope.authRediectChange = authRediectChange;
                if (!!_.intersection(requiredRoles, ['Everyone']).length)
                    return user;

                if (!$cookies.get('redirectOnAuthMsg') || $cookies.get('redirectOnAuthMsg') === 'false')
                    openDialog();
                else
                    $rootScope.$emit("signIn");

                throw user; // stop route change!
            }
            else if (!hasRole)
                $location.url('/403?returnurl=' + encodeURIComponent($location.url()));

            return user;
        });

        //============================================================
        //
        //============================================================
        function openDialog() {
            $rootScope.redirectOnAuthMsg = false;
            $cookies.put('redirectOnAuthMsg', false, { path: '/', expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) });
            ngDialog.open({
                template: redirectDialog,
                className: 'ngdialog-theme-default',
                closeByDocument: false,
                plain: true,
                scope: $rootScope
            }).closePromise.then(function (retVal) {
                if (retVal.value)
                    $rootScope.$emit("signIn");
                else
                    $window.history.back();
            });
        }

        //============================================================
        //
        //
        //============================================================
        function authRediectChange(value) {
            $cookies.put('redirectOnAuthMsg', value, { path: '/', expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) });
        }

    }];
}


app.run(["locale", '$injector', function (locale, $injector,) {
    registerVuePlugin('$locale', locale);

    window.Vue.use(new AngularVueRoutePlugin ($injector));
    window.Vue.use(new AngularVueRouterPlugin($injector));
    window.Vue.use(new AngularVueAuthPlugin($injector));
      
}]);
    
function registerVuePlugin(name, service){
    const newPlugin = new CreateAngularVuePlainPlugin(name, service)
    window.Vue.use(newPlugin);
}
export const AngularVueAuthPlugin = ($injector) =>{

    if(!$injector)
        throw new Error('Angular $injector not provided, cannot use AngularVueRoutePlugin plugin');

    let user;
    let userToken;

    const auth ={
        get user()          { return user; },
        get loggedIn()      { return user.isAuthenticated },
        setUser(newUser)    { user = newUser },
        setUserToken(token) { userToken = token; },

        logout()        { throw new Error('Not Implemented'); },
        fetchUser()     { throw new Error('Not Implemented'); },
        hasScope(scopeName)      { 

            let rolesToValidate = [];
            if(typeof scopeName == 'string')
                rolesToValidate = [scopeName];
            else if(!Array.isArray(scopeName))
                throw new Error("`scopeName` must be string or array od string");

            rolesToValidate = scopeName;

            const hasRole = rolesToValidate.find(scope=>user.roles.includes(scope));

            return !!hasRole;
        },
        refreshTokens() { throw new Error('Not Implemented'); },
        onError()       { throw new Error('Not Implemented'); },
        onRedirect()    { throw new Error('Not Implemented'); },
        strategy :      { 
            token : { 
                get()      { return userToken; },
                set(token) { userToken = token }                
            },
            get refreshToken() { throw new Error('Not Implemented');  }            
         },
    }

    return {
        install(Vue, options) {
            if(!Vue.prototype.$auth)
                Vue.prototype.$auth = auth;
        }
      }
};