define(['app','require'], function(app,require) { 'use strict';

	return app.directive('fbLike',[function() {
		return {

			restrict : "E",
			template : '<a class="fb-like" data-href="https://www.facebook.com/CristianaPascaPalmer/" data-layout="button_count" data-action="like" data-size="small" data-show-faces="false" data-share="false"></a>',
            replace: true,
			scope: {},
			link: function ($scope) {
				require(['services/fb'], function() {
                  	window.FB.XFBML.parse();
			  	});
			}
		};
	}]);
});
