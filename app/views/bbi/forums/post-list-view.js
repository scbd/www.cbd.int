import links from '~/data/bbi/links-platform.json'
import '~/directives/bbi/forums/cbd-forums'
import '~/services/user-settings'
import '~/directives/bbi/menu'

export { default as template } from './post-list-view.html'

export default ["$scope", "$http", "$q", "$route", "$routeParams",
     function($scope, $http, $q, $route, $routeParams) {
        $scope.links=links.links;
        $scope.$root.page={};
        $scope.$root.page.title = "Forum Posts: Bio Bridge Initiative";	
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


        });

        $scope.isAdmin = function(){
            return roleService.isAbsAdministrator() ||
            roleService.isAdministrator()

        }

        $scope.$on('signIn', function(evt, user){
           $route.reload();
        });

    }];