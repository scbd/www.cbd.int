import _   from 'lodash'
import app from '~/app'
import '~/services/article-service'
import '~/services/conference-service'
import '~/directives/social-media'
import '~/filters/lstring'
import '~/filters/moment'
import '~/directives/articles/cbd-article-cover-image' 

export { default as template } from './conferences.html'

export default ['$location','$scope', '$rootScope', 'conferenceService', '$q', '$compile', 'articleService',
        function ($location,$scope, $rootScope, conferenceService, $q, $compile, articleService) {
       
            var conferenceHeader = angular.element("#conferenceHeader");
            conferenceHeader.css('display', 'none');
            conferenceHeader.html('')
			var _ctrl = this;
                // institution:'CBD',
            var query = {
                "showOnPortal":true,
                code: { $exists :1 },
                conference: { $exists :1 }
            }
            var fields = {
                _id:1, Title:1, Description:1, Venue:1, StartDate:1, EndDate:1, timezone:1, code:1, active:1
            };
            $q.when(conferenceService.getConferences(query, fields, { active:-1, StartDate:-1}))
            .then(function(conferences){
                

                var ag = [];
                var tags = [];
                _.map(conferences.data, function(conference){
                    tags.push(conference.code);
                });
                
                ag.push({"$match":{ "$and" : [{"adminTags":{"$all":['conferences', 'introduction', 'home-page']}}, 
                                              { "adminTags" : { $in: _(tags).map(kebabCase).value()}}]}});
                ag.push({"$project" : { coverImage:1, adminTags:1, title:1}});

                articleService.query({ "ag" : JSON.stringify(ag) })
                .then(function(articles){                    
                    _.each(articles, function(article){
                        var conference = _.find(conferences.data, function(conf){
                            var tags = _(article.adminTags).map(kebabCase).value()
                            return _.includes(tags, conf.code)
                        })
                        if(conference){
                            //sometime the file name has space/special chars, use new URL's href prop which encodes the special chars
							const url = new URL(article.coverImage.url)
							article.coverImage.url = url.href;

                            article.url_300 = article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&500x300/')
                            article.url_1200 = article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&1200x600/')
                            
                            conference.article = article;
                        }
                    });
                    $scope.activeConference = conferences.data.splice(0, 1)[0];                    
                    $scope.conferences = conferences.data;
                })
            });


            $scope.showConference = function(code){
                // $q.when(conferenceService.getActiveConference(code))
                // .then(function(conf){
                        
                //     require(['directives/meetings/conference-header'], function(){
                //         conferenceHeader.css('display', 'block');
                //         conferenceHeader.html('').append('<conference-header><conference-header>')
                //         $compile(conferenceHeader.contents())($rootScope);

                        window.location = '/conferences/'+encodeURIComponent(code);
                //     });
                
                // })
            }

            
            function kebabCase(val){
                return val.toLowerCase().replace(/\s/g, '-')
            }
    }];
