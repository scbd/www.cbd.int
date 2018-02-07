define(['app', 'text!./header-nav.html','directives/es-pages/like'], function(app, html) { 'use strict';
	window.twttr = (function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0],
	t = window.twttr || {};
	if (d.getElementById(id)) return t;
	js = d.createElement(s);
	js.id = id;
	js.src = "https://platform.twitter.com/widgets.js";
	fjs.parentNode.insertBefore(js, fjs);

	t._e = [];
	t.ready = function(f) {
	t._e.push(f);
	};

return t;
}(document, "script", "twitter-wjs"));


	return app.directive('headerNav',['$location',function($location) {
		return {

			restrict : "E",
			template : html,
            replace: true,
			scope: {},
			link: function ($scope,$elm) {
				 $elm.find('li').each(function(){
					 if(this.id === ($location.path()+'L') || ($location.path()==='/' && this.id==='cpphomeL'))
						angular.element(this).children('a').addClass('active');

					 if(this.id===$location.path() && this.id!=='cpphome' && $location.path().length>1)
					 	angular.element(this).children('a').addClass('active');
				 })
				 
				 var $ = function (id) { return document.getElementById(id); };
				 function loadTwitter() {!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");}

				 var twitter = $('twitter-wjs');
				 twitter.remove();
				 loadTwitter();
			}
		};
	}]);
});
