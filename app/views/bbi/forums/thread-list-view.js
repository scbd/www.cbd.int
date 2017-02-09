define(['app','lodash', 'directives/bbi/forums/cbd-forums'], function(app,_) {


    return ["$scope", "$http", "$q", "$filter", "$timeout", "$location", "$route","user","$rootScope",
        function($scope, $http, $q, $filter, $timeout, $location, $route,user,$rootScope) {
            var _ctrl = this;
            //$scope.forumId = 17384;
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
});
