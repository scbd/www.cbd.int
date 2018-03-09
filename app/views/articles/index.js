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


            $q.when(articleService.getArticle($route.current.params.articleId))
            .then(function(article){
                $scope.article = article
            })
    }];
});
