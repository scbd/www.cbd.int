import '~/app'
import '~/directives/social-media'
import CbdArticle from '~/directives/articles/cbd-article.vue';
import Vue from 'Vue';
import _ from 'lodash'
import { cssEscape } from '~/util/Css.Escape';

export { default as template } from './index.html'

export default ['$scope', '$route', function ($scope,  $route) {
       
            Vue.component('CbdArticle', CbdArticle)
			var _ctrl = this;

            function buildQuery(){
                var ag   = [];
                var tags = [];
                
                if($route.current.params.code)
                    tags.push(encodeURIComponent($route.current.params.code));
                
                if($route.current.params.articleTag)
                    tags.push(encodeURIComponent($route.current.params.articleTag));

                if((($route.current||{}).params||{}).urlTag)
                    tags = tags.concat($route.current.params.urlTag);

                $scope.articleAdminTags = _(tags).map(kebabCase).value();
                var match = { "adminTags" : { $all: $scope.articleAdminTags}};

                if($route.current.params.articleId)
                    match = {_id: { $oid: $route.current.params.articleId}}

                ag.push({"$match"   : match });
                ag.push({"$project" : { title:1, content:1, coverImage:1}});
                ag.push({"$sort"    : { "meta.updatedOn":-1}});
                ag.push({"$limit"   : 1 });

                $scope.articleQuery = { ag : JSON.stringify(ag) };;
            }
            $scope.onArticleLoad = function(article){

                $scope.article = article;
                $scope.isLoading = false;
            }
            $scope.cssEscape = function(url){
                return cssEscape(url)
            }

            function kebabCase(val){
                return val.toLowerCase().replace(/\s/g, '-')
            }

            buildQuery();

    }];
