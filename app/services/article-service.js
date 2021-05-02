import _   from 'lodash'
import app from '~/app'
import 'angular-cache'

    app.factory("articleService", ['$http', 'CacheFactory', function ($http, CacheFactory) {
            var httpCache = CacheFactory.get('articlesHttpCache');
            if (!httpCache) {
                httpCache = CacheFactory.createCache('articlesHttpCache', {
                    deleteOnExpire: 'aggressive',
                    recycleFreq   : 10000,
                    maxAge        : 5 * 60 * 1000,
                    storageMode   : 'memory',
                    storagePrefix : 'httpCache_'
                });
            }
            
            function query(qs){
                
                qs = _.defaults({}, qs||{});
                
                return $http.get('/api/v2017/articles', { params: qs, cache:httpCache})
                        .then(function(data){
                            return data.data;
                        });
                
            }
            function get(articleId){
                
                return $http.get('/api/v2017/articles/' + encodeURIComponent(articleId), {cache:httpCache})
                        .then(function(data){
                            return data.data;
                        });                
            }

            return {
                get    : get,
                query  : query
            }

    }]);


