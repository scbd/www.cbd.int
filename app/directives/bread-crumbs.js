define(['app', 'text!./bread-crumbs.html'], function(app, template) {

	return app.directive('breadCrumbs', ['$location', '$window','$route',   function($location, $window, $route) {
		return {
            restrict : "E",
            template : template,
            link: function ($scope){
                $scope.crumbs = getPaths($location)
                $scope.$on('$routeChangeSuccess', function(){
                    $scope.crumbs = getPaths($location)
                    $scope.host   = getHost($location)
                })
            }
        }
    }]);

function getPaths($location){

    var crumbs = [] 
    var port   = ($location.port() == 443 || $location.port() == 80)? '/' : ':' +$location.port() + '/'
    var host   = $location.protocol() + '://' + $location.host() + port

    var path   = $location.absUrl().replace(host, '')

    path.split('/').forEach(function(element) {
        crumbs.push({
            name: element, //TODO: translation ???
            href: host + getPathFromCrumb(crumbs, element)
        })
    });

    return crumbs
}

function getHost($location){

  var crumbs = [] 
  var port   = ($location.port() == 443 || $location.port() == 80)? '/' : ':' +$location.port() + '/'
  var host   = $location.protocol() + '://' + $location.host() + port

  return host 
}

function getPathFromCrumb(crumbs, crumbName){
    var fromPath = []

    if(!crumbs.length)  [crumbName]

    for (var i = 0; i < crumbs.length; i++) {

        fromPath.push(crumbs[i].name);

        if(crumbs[i].name === crumbName) break;
    }

    fromPath.push(crumbName)
    return fromPath.join('/')
}

});
