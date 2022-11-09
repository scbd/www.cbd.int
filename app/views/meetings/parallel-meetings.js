import '~/directives/social-media'
import '~/services/conference-service'
import CbdArticle from '~/directives/articles/cbd-article.vue';
import Vue from 'Vue';
import _ from 'lodash';
import { cssEscape } from '~/util/Css.Escape';

export { default as template } from './parallel-meetings.html'

export default ['$scope', '$route', '$location', 'conferenceService', '$q', '$rootScope',
 function ($scope,  $route, $location, conferenceService, $q, $rootScope) {
       
            Vue.component('CbdArticle', CbdArticle)
            $scope.isLoading = true;

            function buildQuery(){
                var ag   = [];
                var tags = [];
                
                if($route.current.params.code)
                    tags.push(encodeURIComponent($route.current.params.code));
                
                if($route.current.params.meeting)
                    tags.push(encodeURIComponent($route.current.params.meeting));

                if((($route.current||{}).params||{}).urlTag)
                    tags = tags.concat($route.current.params.urlTag);

                $scope.parallelMeetingAdminTags = _(tags).map(kebabCase).value();

                var match = { "adminTags" : { $all: $scope.parallelMeetingAdminTags }};

                ag.push({"$match"   : match });
                ag.push({"$project" : { title:1, content:1, coverImage:1}});
                ag.push({"$sort"    : { "meta.updatedOn":-1}});
                ag.push({"$limit"   : 1 });

                $scope.articleQuery = { ag : JSON.stringify(ag) };;
            }

            $scope.onArticleLoad = function(article){
                    $scope.article = article;
                    $scope.finishLoading = true;
            }
            $scope.getUrl = function(parallelMeeting){

                if(parallelMeeting.url)
                    return parallelMeeting.url 
                
                if(parallelMeeting.code)
                    return '/conferences/'+$scope.meeting.code+'/parallel-meetings/'+parallelMeeting.code;

                return '#'
            }

            $scope.cssEscape = function(url){
                return cssEscape(url)
            }

            $q.when(conferenceService.getActiveConference())
            .then(function(meeting){
                $scope.meeting = meeting;
                $scope.isLoading = false;
            });

            function kebabCase(val){
                return val.toLowerCase().replace(/\s/g, '-')
            }
            
            buildQuery()
            
    }];