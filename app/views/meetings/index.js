import app from 'app' 
import _ from 'lodash'
import Vue from 'vue'
import ConferenceCalComp from 'conferenceCal'

import 'ngVue'
import '~/services/conference-service'
import '~/services/article-service'
import 'directives/social-media'
import '~/directives/articles/cbd-article'

var VueComponent = Vue.component('conference-cal', ConferenceCalComp)
app.value('ConferenceCal',VueComponent)

export default ['$location','$scope','$timeout', '$route', '$sce', 'conferenceService', '$q',
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
                    if(meeting)
                        $location.path('/'+ meeting.code);  
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
