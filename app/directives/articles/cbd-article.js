define(['app', 'text!./cbd-article.html','lodash', 'services/article-service'], function(app, template, _) {
	 'use strict';

	app.directive('cbdArticle', ['$sce', '$q', 'articleService', function ($sce, $q, articleService)
	{
		return {
			restrict: 'E',
			template : template,
			replace: true,
			scope: {
				query : '=query',
				onLoad: '&onLoad'
			},
			link: function ($scope, $element, $attr)
			{
				$scope.hideCoverImage = $attr.hideCoverImage||false;

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
					
					$q.when(articleService.query({ "ag" : JSON.stringify($scope.query) }))
					.then(function(article){
						if(article.length ==0 )
							$scope.article = {
								content : { en : 'No information is available for this link'}
							}
						else
							$scope.article = article[0];
						
						$scope.onLoad({article: article[0]});
					});
				}
				
				// $scope.$watch('query', function(newVal, oldVal){
				// 	if(newVal){
						loadArticle();
				// 	}
				// })
			}
		};
	}]);
});

