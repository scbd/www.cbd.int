import _ from 'lodash'
import links from '~/data/bbi/links-platform.json'
import '~/directives/bbi/crumbs'
import '~/directives/bbi/menu'
import '~/directives/bbi/forms/edit-organization'
import '~/directives/bbi/forms/edit-bbi-contact'
import '~/directives/bbi/forms/edit-bbi-profile'
import '~/directives/bbi/forms/edit-bbi-opportunity'
import '~/directives/bbi/forms/edit-bbi-assistance'

export { default as template } from './edit.html'

export default ['$scope','$routeParams','user', function ($scope,$routeParams,user) {


        var _ctrl = this;
				_ctrl.links=links.links;
				_ctrl.user =user;
				_ctrl.schema = _.camelCase($routeParams.schema);
				var id =$routeParams.id;

				$scope.$root.page={};
				$scope.$root.page.title = "Edit: BBI Web Platform";
				// console.log('schema',schema);
				// console.log('id',id);
    }];