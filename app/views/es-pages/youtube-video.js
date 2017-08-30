define(['app','data/es-pages/media','directives/es-pages/header-nav'], function(app,media) { 'use strict';

return ['$routeParams','$scope','$sce','$location', function ($routeParams,$scope,$sce,$location) {

			var _ctrl = this;
			// if(~$routeParams.id.indexOf('twiiter')){
			// 	_ctrl.twitter=true;
			//     _ctrl.url=decodeURIComponent($routeParams.id);
			// }else
			// 	_ctrl.url= $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+$routeParams.id+'?rel=0');
			//
			// $scope.$root.page={};
			// $scope.$root.page.title = "Media: Cristiana Pașca Palmer";

			for(var i=0; i<media.length;i++)
				if(media[i]._id===$routeParams.id)
					_ctrl.media=media[i];

			if(!_ctrl.media)$location.path('/404');

			if(~_ctrl.media.url.indexOf('twitter'))
				_ctrl.media.twitter=true;
			else
				_ctrl.url= $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+getyoutubeId(_ctrl.media.url)+'?rel=0');


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
