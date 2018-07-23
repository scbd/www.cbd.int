define(['app', 'lodash', 'services/article-service'], function(app, _) { 'use strict';

return ['$location','$scope','$timeout', '$route', '$sce', '$q', 'articleService',
        function ($location,$scope,$timeout,  $route, $sce, $q, articleService) {
       
			var _ctrl = this;

            $scope.trustedHtml = function (plainText) {
                return $sce.trustAsHtml(plainText);
            }
            

            $scope.getSizedImage = function(url){
                if(!url)
                    return url;
                var size = '1200x600'
                return url.replace(/attachments\.cbd\.int\//, '$&'+size+'/')
            }

            function loadArticle(){
                var ag = [];
                var match = {
                    $and:[
                        {"adminTags.title.en":encodeURIComponent($route.current.params.code)},
                        {"adminTags.title.en":encodeURIComponent($route.current.params.articleTag)}
                    ]
                }
                ag.push({"$match"   : match });
                ag.push({"$project" : { title:1, content:1, coverImage:1}});
                ag.push({"$sort"    : { "meta.updatedOn":-1}});
                ag.push({"$limit"   : 1 });

                $q.when(articleService.query({ "ag" : JSON.stringify(ag) }))
                .then(function(article){
                    if(article.length ==0 )
                        $scope.article = {
                            content : { en : 'No information is available for this link'}
                        }
                    else
                        $scope.article = article[0];
                });
            }

            loadArticle();

    }];
});
