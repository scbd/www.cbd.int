define(['app'], function (app) {

    app.factory("articleService", ['$http', function ($http) {

            function query(qs){
                
                return $http.get('/api/v2017/articles', { params: qs})
                        .then(function(data){
                            return data.data;
                        });
                
            }
            function get(articleId){
                
                return $http.get('/api/v2017/articles/' + encodeURIComponent(articleId))
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
