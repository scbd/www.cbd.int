define(['app', 'lodash', 'services/meeting-service'], function(app, _) { 'use strict';

return ['$location','$scope','$timeout', '$route', '$sce', 'meetingService', '$q',
        function ($location,$scope,$timeout,  $route, $sce, meetingService, $q) {
       
			var _ctrl = this;

            $scope.trustedHtml = function (plainText) {
                return $sce.trustAsHtml(plainText);
            }
            $q.when(meetingService.getActiveMeeting())
            .then(function(meeting){
                $scope.meeting = meeting;
                if(!$route.current.params.code){
                    $timeout(function(){
                        if(meeting)
                            $location.path('/'+ meeting.code);                    
                    }, 500)
                }
            });
    }];
});
