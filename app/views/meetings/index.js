define(['app', 'lodash', 'services/conference-service', 'services/article-service', 'services/fb'], function(app, _) { 'use strict';

return ['$location','$scope','$timeout', '$route', '$sce', 'conferenceService', '$q', 'articleService',
        function ($location,$scope,$timeout,  $route, $sce, conferenceService, $q, articleService) {
       
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
                else{
                    $q.when(articleService.getArticle(meeting.conference.articleId))
                    .then(function(article){
                        $scope.meeting.conference.article = article
                    })
                }

            });

            $scope.getSizedImage = function(url){
                if(!url)
                    return url;
                var size = '1200x600'
                return url.replace(/attachments\.cbd\.int\//, '$&'+size+'/')
            }

            if (window.FB && window.FB.XFBML){
                window.FB.XFBML.parse();
            }
            
    }];
});
