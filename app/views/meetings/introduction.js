define(['app', 'services/fb', 'directives/articles/cbd-article', 'services/conference-service'], function(app) { 'use strict';

return ['$scope', '$route', '$location', 'conferenceService', '$q', '$rootScope',
 function ($scope,  $route, $location, conferenceService, $q, $rootScope) {
       
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

                $scope.article = article;                
                $scope.documentsLink = $location.path()+'/documents'
                $scope.isLoading = false;
                
                if(($rootScope.conference||{}).selectedMenu && $rootScope.conference.selectedMenu.hideDocumentsLink)
                    $scope.documentsLink = undefined;
                else if(!article){
                    $location.path($scope.documentsLink);
                    return;
                }
                
                if (window.FB && window.FB.XFBML){
                    window.FB.XFBML.parse();
                }
            }
            
            buildQuery();
    }];
});
