define(['app', 'lodash', 'services/conference-service'], function(app, _) { 'use strict';

return ['$location','$scope','$timeout', '$route', '$sce', 'conferenceService', '$q',
        function ($location,$scope,$timeout,  $route, $sce, conferenceService, $q) {
       
			var _ctrl = this;

            $scope.trustedHtml = function (plainText) {
                return $sce.trustAsHtml(plainText);
            }
            $q.when(conferenceService.getActiveConference())
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
