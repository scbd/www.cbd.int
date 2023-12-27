import app from '~/app';
import { mapView } from './mixin';

// Static views
import * as notificationIdView  from '~/views/notifications/index-id'

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    .when('/:symbol', { ...mapView(notificationIdView) })
    .when('/', { controller: ["$rootScope", autoReload], template:'Loading...<br><a href="/notifications" target="_self">Please click here if your are not automatically redirected...</a>' })
    .otherwise({redirectTo: '/'});
}]);

app.run(['$rootScope', function($rootScope){
    $rootScope.$on('$routeChangeSuccess', (evnt, current, previous)=>{
        $rootScope.allowHardReload = !!previous && previous.$$route != current.$$route
    })
}])

function autoReload($rootScope) {
    if($rootScope.allowHardReload)
        window.location.reload();
}