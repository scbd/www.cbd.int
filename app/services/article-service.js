define(['app'], function (app) {

    app.factory("articleService", ['$http', '$q', function ($http, $q) {

            function query(qs){
                
                return $q.when($http.get('/api/v2017/articles', { params: qs, cache:true}))
                        .then(function(data){
                            return data.data;
                        });
                
            }
            function get(articleId){
                
                return $q.when($http.get('/api/v2017/articles/' + encodeURIComponent(articleId), {cache:true}))
                        .then(function(data){
                            return data.data;
                        });                
            }

            return {
                get    : get,
                query  : query
            }

    }]);

});
