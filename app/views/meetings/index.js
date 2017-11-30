define(['app', 'lodash', 'services/meeting-service'], function(app, _) { 'use strict';

return ['$location','$scope','$timeout', '$route', '$sce', 
        function ($location,$scope,$timeout,  $route, $sce) {
       
			var _ctrl = this;

            $scope.trustedHtml = function (plainText) {
                return $sce.trustAsHtml(plainText);
            }

            if(!$route.current.params.code){
                $timeout(function(){
                    if($scope.$parent.meeting)
                        $location.path('/'+ $scope.$parent.meeting.code);                    
                }, 500)
            }
    }];
});
