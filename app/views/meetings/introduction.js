import '~/directives/social-media';
import '~/directives/articles/cbd-article';
import '~/services/conference-service';
import app from '~/app'

export { default as template } from './introduction.html';

export default ['$scope', '$route', '$location', '$http', '$rootScope',
 function ($scope,  $route, $location, $http, $rootScope) {
       
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

                var match = { "adminTags.title.en" : { $all: tags}};

                ag.push({"$match"   : match });
                ag.push({"$project" : { title:1, content:1, coverImage:1}});
                ag.push({"$sort"    : { "meta.updatedOn":-1}});
                ag.push({"$limit"   : 1 });

                $scope.articleQuery = ag;
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
            
            buildQuery();
    }];