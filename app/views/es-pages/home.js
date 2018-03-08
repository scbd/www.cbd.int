define(['app','services/fb','directives/carousel', 'directives/es-pages/header-nav'], function() { 'use strict';


return ['$location','$scope','fb','$document','ngMeta','$q','$http', function ($location,$scope,fb,$document,ngMeta,$q,$http) {

			$scope.carousel=undefined;
			query();

			var _ctrl = this;
			_ctrl.goTo = goTo;
			$scope.$root.page={};

			angular.element($document).ready(function() {

				$scope.$root.page.title = "Cristiana Pașca Palmer, Executive Secretary of the UN Biodiversity Convention. UN Assistant Secretary-General.";
				$scope.$root.page.description = 'The latest news, statements and events from Cristiana Pașca Palmer work on UN Biodiversity Convention.'
				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', $scope.$root.page.description);
				fb.set('og:url',window.location.href);

				fb.setImage('/app/images/es-pages/es5.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary/work','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary/contact']);

				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','/app/images/es-pages/es5.jpg');

			});

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}

				function extractFirstParagraph (txt) {
				  var rx = /(^).*?(?=\n|$)/g;
				  var arr = rx.exec(txt);

          if(arr && arr[0])
				      if(typeof arr[0] === 'string' && arr[0].length>350)
                      arr[0] = arr[0].substring(0,350);
				  return arr[0] || txt;
				}
				//=======================================================================
				//
				//=======================================================================
				function query() {

						var queryParameters = {
								'q': 'schema_s:event AND thematicArea_ss:3FEF79FF-9EA2-4E3A-BEC9-2991CCDD7F3A',
								'sort': 'updatedDate_dt desc',
								'fl': 'title_t,description_t,identifier_s,startDate_dt,cover_s',
								'wt': 'json',
								'start': 0,
								'rows': 5,
								'facet': true,
								'facet.limit': 999999,
								'facet.mincount' : 1
						};
						var pagePromise = $q.when($http.get('/api/v2013/index/select', {  params: queryParameters}))
							.then(function (data) {
									data=data.data;
								for(var i in data.response.docs){
									data.response.docs[i].description_t=extractFirstParagraph(data.response.docs[i].description_t);
									data.response.docs[i].url_ss ='/event/'+data.response.docs[i].identifier_s
										data.response.docs[i].visible = true;
								}

								$scope.carousel=data.response.docs;
						}).catch(function(error) {
								console.log('ERROR: ' + error);
						});

						return pagePromise;
				}// query

    }];
});
