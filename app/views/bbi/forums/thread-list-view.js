import links from '~/data/bbi/links-platform.json'
import '~/directives/bbi/forums/cbd-forums'
import '~/services/user-settings'
import '~/directives/bbi/menu'

    
export { default as template } from './post-list-view.html'

export default ["$scope", "$http", "$q", "$filter", "$timeout", "$location", "$route","user","$rootScope",
        function($scope, $http, $q, $filter, $timeout, $location, $route,user,$rootScope) {
            $scope.links=links.links;
            $scope.$root.page={};
            $scope.$root.page.title = "Forum Threads: Bio Bridge Initiative";
            $scope.user=$rootScope.user=user;

            $scope.isAdmin = !!_.intersection(user.roles, ["Administrator","BbiAdministrator"]).length;

            if (!$route.current.$$route.postUrl) {
                throw 'Post URL not specified in route, please postUrl attribute in routes'
            } else
                $scope.postUrl = $route.current.$$route.postUrl;

            $scope.forumId = $route.current.$$route.forumId;
			$scope.forum = $route.current.$$route.text;

            if ($location.search().forumid && $location.search().threadid) {
                  $scope.forumId = $location.search().forumid;
                  $scope.threadId = $location.search().threadid;
                    $location.path($scope.postUrl + '/' + $location.search().threadid);
                    return;
            }


			// $scope.isAdmin = function(){
			// 	return roleService.isAbsAdministrator() ||
			// 	roleService.isAdministrator()
			//
			// };

            // $scope.$on('signIn', function(evt, user){
            //    $route.reload();
            // });

        }
    ];