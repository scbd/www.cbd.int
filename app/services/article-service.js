define(['app'], function (app) {

    app.factory("articleService", ['$http', '$q', function ($http, $q) {

            function getArticle(articleId){
                
                return $q.when($http.get('/api/v2017/articles/' + articleId, {cache:true}))
                        .then(function(data){
                            return data.data;
                        });
                
            }
            return {
                getArticle    : getArticle
            }

    }]);

});
