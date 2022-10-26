import app from '~/app'
import template from './cbd-article.html'
import _ from 'lodash'
import './cbd-article-cover-image'
import '~/services/article-service'
import '~/authentication'

import('css!https://cdn.cbd.int/@scbd/ckeditor5-build-inline-full@22.0.0/build/ckeditor.css');

	app.directive('cbdArticle', ['$sce', '$q', 'articleService', 'authentication', '$location', '$timeout', '$http', 'locale',
	  function ($sce, $q, articleService, authentication, $location, $timeout, $http, locale)
	{
		return {
			restrict: 'E',
			template : template,
			replace: true,
			scope: {
				query : '=query',
				onLoad: '&onLoad',
				article: '=?'
			},
			link: function ($scope, $element, $attr)
			{
				$scope.hideCoverImage = $attr.hideCoverImage||false;
				$scope.returnUrl	  = $location.absUrl();
				$scope.locale 		  = locale;
				$scope.trustedHtml = function (plainText) {
					return $sce.trustAsHtml(plainText);
				}
				
				function loadArticle(){
					var promiseQ = articleService.query({ "ag" : JSON.stringify($scope.query) })
					if($scope.article){
						var q = $q.defer();
                        q.resolve([$scope.article]);
                        promiseQ = q.promise;
					}
					$q.when(promiseQ).then(function(article){
						if(article.length ==0 )
							$scope.article = {
								content : { en : 'No information is available for this link'}
							}
						else
							$scope.article = article[0];

						preprocessOEmbed();

						if(($scope.article.coverImage||{}).url){
							//sometime the file name has space/special chars, use new URL's href prop which encodes the special chars
							const url = new URL($scope.article.coverImage.url)
							$scope.article.coverImage.url = url.href;

							$scope.article.coverImage.url_1200  = $scope.article.coverImage.url.replace(/attachments\.cbd\.int\//, '$&1200x600/')
						}
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
				function preprocessOEmbed(html) {

					$timeout(function(){
                        var getLocation = function(href) {
                            var l = document.createElement("a");
                            l.href = href;
                            return l;
                        };
                        function parseQuery(queryString) {
                            var query = {};
                            var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
                            for (var i = 0; i < pairs.length; i++) {
                                var pair = pairs[i].split('=');
                                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
                            }
                            return query;
                        }

                        document.querySelectorAll( 'oembed[url]' ).forEach(function(element) {
                            var url = element.attributes.url.value;
                            // var urlDetails = getLocation(url);
                            // var qs = parseQuery(urlDetails.search);
                            var params = {
                                url : encodeURI(url),
                                // maxheight:qs.height||qs.maxheight||'450',
                                // maxwidth:qs.width||qs.maxwidth||'100%'
                            }
                            $http.get('/api/v2020/oembed', {params:params})
                            .then(function(response){
                                var embedHtml = '<div class="ck-media__wrapper" style="width:100%">' + response.data.html +'</div>'
                                element.insertAdjacentHTML("afterend", embedHtml);
                            })
                        });

                    }, 200)
				}

				loadArticle();
			}
		};
	}]);





