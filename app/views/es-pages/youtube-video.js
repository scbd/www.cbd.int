define(['app','data/es-pages/media','directives/es-pages/header-nav','filters/title-case','services/fb'], function(app,media) { 'use strict';

return ['$routeParams','$scope','$sce','$location','fb','$document','$filter','ngMeta', function ($routeParams,$scope,$sce,$location,fb,$document,$filter,ngMeta) {

			var _ctrl = this;

			for(var i=0; i<media.length;i++)
				if(media[i]._id===$routeParams.id)
					_ctrl.media=media[i];

			if(!_ctrl.media)$location.path('/404');

			if(~_ctrl.media.url.indexOf('twitter'))
				_ctrl.media.twitter=true;
			else
				_ctrl.url= $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+getyoutubeId(_ctrl.media.url)+'?rel=0');

			angular.element($document).ready(function() {
				$scope.$root.page ={};
				$scope.$root.page.title = $filter('titleCase')(_ctrl.media.title);

				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:url',window.location.href);

				fb.setImage(_ctrl.media.img);
				ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:image',_ctrl.media.img);
			});

			function getyoutubeId(url){

				if(~url.indexOf('youtube') || ~url.indexOf('youtu.be')){
						var matches;
                      matches=url.match(/v=([0-9a-zA-Z]+)/);
                      if(!matches){
                          var parts = url.split("/");

                          var result = parts[parts.length - 1];

                          if(result)
                              if(!matches){
								  matches =[];
                                  matches.push(result);
                              }
                              else matches.push(result);
                      }
					  return matches[0];
                }
				return null;
			}
    }];
});
