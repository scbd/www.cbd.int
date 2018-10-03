 define(['app', 'lodash','vue','conferenceCal', 'ngVue', 'services/conference-service', 'services/article-service', 'directives/social-media', 'directives/articles/cbd-article','css!conferenceCalCSS'], function(app, _,Vue,ConferenceCalComp) { 'use strict';

var VueComponent = Vue.component('conference-cal', ConferenceCalComp)
app.value('ConferenceCal',VueComponent)

return ['$location','$scope','$timeout', '$route', '$sce', 'conferenceService', '$q',
        function ($location,$scope,$timeout,  $route, $sce, conferenceService, $q) {
       
			var _ctrl = this;

             $scope.code = $route.current.params.code
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
                    // $q.when(articleService.get(meeting.conference.articleId))
                    // .then(function(article){
                    //     $scope.meeting.conference.article = article
                    // })
                    var ag   = [];    
                    var match = { "_id" : { $oid : meeting.conference.articleId}};
    
                    ag.push({"$match"   : match });
                    ag.push({"$project" : { title:1, content:1, coverImage:1}});
                    ag.push({"$sort"    : { "meta.updatedOn":-1}});
                    ag.push({"$limit"   : 1 });
    
                    $scope.articleQuery = ag;
                    
                }

            });

            $scope.onArticleLoad = function(article){               
                
                $scope.article = article;
                $scope.isLoading = false;
            } 
    }];
});
