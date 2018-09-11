define(['app', 'services/fb', 'directives/articles/cbd-article'], function(app) { 'use strict';

return ['$scope', '$route', '$location', function ($scope,  $route, $location) {
       
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
                     $location.path($location.path()+'/documents');
                     return;
                }
                    
                $scope.isLoading = false;
                if (window.FB && window.FB.XFBML){
                    window.FB.XFBML.parse();
                }
            }

            buildQuery();
    }];
});
