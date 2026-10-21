import '~/directives/social-media';
import '~/services/conference-service';
import '~/directives/view-injector'
import app from '~/app'
import CbdArticle from '~/directives/articles/cbd-article.vue';
import UploadStatementButton from '~/components/meetings/upload-statement-button.vue'
import Vue from 'Vue';
import _ from 'lodash'

export { default as template } from './introduction.html';

export default ['$scope', '$route', '$location', '$http', '$rootScope', '$timeout',
 function ($scope,  $route, $location, $http, $rootScope, $timeout) {

            Vue.component('CbdArticle', CbdArticle)
            $scope.isLoading = true;
            $scope.vueOptions = { components: { UploadStatementButton } };
            $scope.resolveLiteral = function(value) { return function() { return value; }; };
            // without query: the embedded documents button already handles ?uploadStatementBy auto-open
            $scope.uploadRoute = { params: $route.current.params, query: {} };

            $scope.scrollToDocuments = function(){
                document.getElementById('documents').scrollIntoView({ behavior: 'smooth' });
            }

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

                $scope.showDocuments = !(($rootScope.conference||{}).selectedMenu||{}).hideDocumentsLink;

                $http.get("/api/v2016/meetings/"+encodeURIComponent($route.current.params.meeting.toUpperCase()), { params: { f: { uploadStatement:1 } }, cache:true }).then(function(res){
                    $scope.meeting = res.data;
                }).catch(function(){
                    $scope.meeting = null;
                }).then(function(){
                    var meeting = $scope.meeting;
                    return $timeout(function(){
                        var articleBlock = document.getElementById('intro-article');
                        $scope.documentsTall = !!meeting && $scope.showDocuments && !!articleBlock && articleBlock.offsetHeight > window.innerHeight;
                    });
                });
            }
            
            function kebabCase(val){
                return val.toLowerCase().replace(/\s/g, '-')
            }

            buildQuery();
    }];