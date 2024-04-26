import app from '~/app'
import template from './bread-crumbs.html'

app.directive('breadCrumbs', ['$location', function ($location) {
    return {
        restrict: "E",
        template: template,
        link: function ($scope) {

            const updateCrumbs = ()=> { $scope.crumbs = getCrumbs(); }

            $scope.$on('$routeChangeSuccess', updateCrumbs);

            updateCrumbs();
        }
    }

    function getCrumbs() {

        const url = new URL($location.absUrl());
        const parts = url.pathname.split(/\//).filter(p => !!p).map(decodeURIComponent);

        let path = '';

        const crumbs = parts.map(part => {
            path += `/${encodeURIComponent(part)}`

            return {
                name: part, //TODO: translation ???
                href: path
            }
        });

        if (crumbs.at(-1)) {
            crumbs.at(-1).href += url.search; //add current Query string to latest items
        }

        return crumbs;
    }
}]);

