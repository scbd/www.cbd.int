define(['app', 'underscore', 'directives/bbi/forums/cbd-forums',//'ng-breadcrumbs',
        ], function(app, _) {

    return ["$scope", "$http", "$q", "$route", "$routeParams","$rootScope",'$route',//'breadcrumbs',
     function($scope, $http, $q, $route, $routeParams, $rootScope, $route) {//, breadcrumbs

        if (!$route.current.$$route.forumListUrl) {
            throw 'Forum list URL not specified in route, please forumListUrl attribute in routes'
        } else
            $scope.forumListUrl = $route.current.$$route.forumListUrl;

        $scope.forum = $route.current.$$route.text;
        $scope.forumId = $route.current.$$route.forumId
        $scope.threadId = $routeParams.threadId;


        var thread = $http.get('/api/v2014/discussions/threads/' + $scope.threadId);
        $q.when(thread).then(function(response) {

            $scope.threadSubject = response.data.subject;

            // console.log(breadcrumbs);

            // breadcrumbs.options = {'Thread-Subject': response.data.subject};

        });

        $scope.isAdmin = function(){
            return roleService.isAbsAdministrator() ||
            roleService.isAdministrator()

        }

        $scope.$on('signIn', function(evt, user){
           $route.reload();
        });

    }];
});
