define(['app', 'lodash', 'services/meeting-service'], function(app, _) { 'use strict';

return ['$location','$scope','$document', 'meetingService', '$route', '$q', '$sce',
        function ($location,$scope,$document, meetingService, $route, $q, $sce) {
       
			var _ctrl = this;

            $scope.trustedHtml = function (plainText) {
                return $sce.trustAsHtml(plainText);
            }
    }];
});
