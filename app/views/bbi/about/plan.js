define(['app','data/bbi/links','directives/bbi/menu', 'directives/bbi/auto-linker'], function(app,links) { 'use strict';

	return ['$location', function ($location) {

        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.goTo = goTo;

				//============================================================
				//
				//============================================================
				function goTo (url) {
								$location.path(url);
				}
    }];
});
