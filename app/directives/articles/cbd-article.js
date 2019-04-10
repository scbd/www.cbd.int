define(['app', 'text!./cbd-article.html','lodash', 'require', 'services/article-service', 'authentication'], function(app, template, _, require) {
	 'use strict';
	
	require(['css!https://www.cbd.int/management/app/dist/ckeditor5/style.css']);

	app.directive('cbdArticle', ['$sce', '$q', 'articleService', 'authentication', '$location',  function ($sce, $q, articleService, authentication, $location)
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
				$scope.returnUrl	  = $location.absUrl();

				$scope.trustedHtml = function (plainText) {
					return $sce.trustAsHtml(plainText);
				}
				
				loadArticle();
				
				function loadArticle(){
					
					$q.when(articleService.query({ "ag" : JSON.stringify($scope.query) }))
					.then(function(article){
						if(article.length ==0 )
							$scope.article = {
								content : { en : 'No information is available for this link'}
							}
						else
							$scope.article = article[0];

						for(var locale in $scope.article.content) {
							$scope.article.content[locale] = preprocessHtml($scope.article.content[locale]);
						}

						if(($scope.article.coverImage||{}).url)
							$scope.article.coverImage.url_1200  = $scope.article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&1200x600/')
						
						$scope.onLoad({article: article[0]});
						
						$q.when(authentication.getUser())
						.then(function(user){
							if(user)
								$scope.showEdit = authentication.isInRole(user, ['oasisArticleEditor', 'Administrator']);
						})
					});
				}

				//============================================
				//
				//============================================
				function preprocessHtml(html) {

					var holder = $('<div>'+html+'</div>');

					$(holder).find('figure.media > oembed').each(function(){
						var oembed = $(this);
						var src = oembed.attr('url');

						if(src) {
							src = src.replace(/www\.youtube\.com\/watch\?v\=/, "youtube.com/embed/" );
							src = src.replace(/youtube\.com\/watch\?v\=/,      "youtube.com/embed/" );
							src = src.replace(/youtu\.be\//,                   "youtube.com/embed/" );
							src = src.replace(/vimeo\.com\//, "player.vimeo.com/video/" );
	
							oembed.after('<iframe src="'+src+'" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>')
							oembed.remove();
						}

					})

					return holder.html();
				}
			}
		};
	}]);
});




