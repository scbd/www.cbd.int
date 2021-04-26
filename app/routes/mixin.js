import '~/authentication'
import 'ngDialog'
import _ from 'lodash'
import redirectDialog from '../redirect-dialog.html'

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
        return $q.when(authentication.getUser());
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