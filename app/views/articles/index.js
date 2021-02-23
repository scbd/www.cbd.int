import 'app'
import 'directives/social-media'
import '~/directives/articles/cbd-article'

export default ['$scope', '$route', function ($scope,  $route) {
       
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

                var match = { "adminTags.title.en" : { $all: tags}};

                ag.push({"$match"   : match });
                ag.push({"$project" : { title:1, content:1, coverImage:1}});
                ag.push({"$sort"    : { "meta.updatedOn":-1}});
                ag.push({"$limit"   : 1 });

                $scope.articleQuery = ag;
            }
            $scope.onArticleLoad = function(article){

                $scope.article = article;
                $scope.isLoading = false;
            }

            buildQuery();

    }];
