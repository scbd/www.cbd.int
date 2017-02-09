define(['app', 'lodash','data/bbi/links-platform', 'directives/bbi/crumbs', 'directives/bbi/menu',
'directives/bbi/forms/edit-organization',
'directives/bbi/forms/edit-bbi-contact',
'directives/bbi/forms/edit-bbi-profile',
'directives/bbi/forms/edit-bbi-opportunity',
'directives/bbi/forms/edit-bbi-assistance',
], function(app, _,links) { 'use strict';

	return ['$scope','$routeParams','user', function ($scope,$routeParams,user) {


        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.user =user;
				_ctrl.schema = _.camelCase($routeParams.schema);
				var id =$routeParams.id;

				// console.log('schema',schema);
				// console.log('id',id);
    }];
});
