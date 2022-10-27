import '~/directives/social-media';
import '~/directives/articles/cbd-article';
import '~/services/conference-service';
import app from '~/app'
import CbdArticle from '~/directives/articles/cbd-article.vue';
import Vue from 'Vue';
import _ from 'lodash'

export { default as template } from './introduction.html';

export default ['$scope', '$route', '$location', '$http', '$rootScope',
 function ($scope,  $route, $location, $http, $rootScope) {
            
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

                $scope.articleAdminTags = _(tags).map(kebabCase).value();
                var match = { "adminTags" : { $all: $scope.articleAdminTags}};

                ag.push({"$match"   : match });
                ag.push({"$project" : { title:1, content:1, coverImage:1}});
                ag.push({"$sort"    : { "meta.updatedOn":-1}});
                ag.push({"$limit"   : 1 });

                $scope.articleQuery = { ag : JSON.stringify(ag) };;
            }

            $scope.onArticleLoad = function(article){
                if(!article){
                    $location.replace();
                    $location.path($location.path()+'/documents');
                    return;
                }

                $scope.article = article;                
                $scope.isLoading = false;                
                $scope.selectedMenu = ($rootScope.conference||{}).selectedMenu;

                if(($rootScope.conference||{}).selectedMenu && $rootScope.conference.selectedMenu.hideDocumentsLink)
                    $scope.documentsLink = undefined;
                else {
                    $http.get("/api/v2016/meetings/"+encodeURIComponent($route.current.params.meeting)+"/documents/statistics", { params: {c:1},  cache:true}).then(function(res){
                        if((res.data||{}).count)
                            $scope.documentsLink = $location.path()+'/documents'
                    });
                }
            }
            
            function kebabCase(val){
                return val.toLowerCase().replace(/\s/g, '-')
            }

            buildQuery();
    }];