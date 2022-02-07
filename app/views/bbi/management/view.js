import _ from 'lodash'
import links from '~/data/bbi/links-platform.json'
import '~/directives/bbi/crumbs'
import '~/directives/bbi/menu'
import '~/services/editFormUtility'
import '~/directives/bbi/views/view-bbi-contact'
import '~/directives/bbi/views/view-organization'
import '~/directives/bbi/views/view-bbi-profile'
import '~/directives/bbi/views/view-bbi-opportunity'
import '~/directives/bbi/views/view-bbi-request'
import '~/services/mongo-storage'
import '~/services/storage'

export { default as template } from './view.html'

export default ['$scope', '$routeParams',  '$route', 'IStorage','mongoStorage','locale','user', function($scope, $routeParams,  $route, storage,mongoStorage,locale,user) {


        var _ctrl = this;
        _ctrl.links = links.links;
        _ctrl.user=user;
        _ctrl.schema = _.camelCase($routeParams.schema);

        var id = $routeParams.id;
        $scope.$root.page={};
        $scope.$root.page.title = "Record View: BBI Web Platform";


        //==================================
        //
        //==================================
        function init() {
            $scope.loading = true;
            _ctrl.locale=locale;
            var identifier = $route.current.params.id;
            var promise = null;
            var config ={};
            var header={};
            config.headers = {realm : undefined};

            if (identifier && _ctrl.schema!=='bbiRequest'){
                promise = storage.documents.get(identifier,{ cache : false},config);
                promise.then(
                    function(doc) {
                        _ctrl.document = doc.data;
                        var header = storage.documents.get(identifier,{ info:'',cache : false},config);
                        header.then(function(h){
                          _ctrl.header = h.data;
                        });
                        $scope.loading = false;
                    }).then(null,
                    function(err) {
                        $scope.loading = false;
                        onError(err.data, err.status);
                        throw err;
                    });

            }
            else if(identifier && _ctrl.schema==='bbiRequest')
                mongoStorage.loadDoc('bbi-requests',id).then(loadDoc);


        }

        //=======================================================================
  			//
  			//=======================================================================
  			function loadDoc(doc) {
  					_ctrl.document=doc;
            $scope.loading = false;
  			}

        //==================================
        //
        //==================================
        function onError(error, status) {
            $scope.status = "error";

            if (status == "notAuthorized") {
                _ctrl.status = "hidden";
                _ctrl.error = "You are not authorized to modify this record";
            } else if (status == 404) {
                _ctrl.status = "hidden";
                _ctrl.error = "Record not found.";
            } else if (status == "badSchema") {
                _ctrl.status = "hidden";
                _ctrl.error = "Record type is invalid.";
            } else if (error.Message)
                _ctrl.error = error.Message;
            else
                _ctrl.error = error;
        };
        init();
    }];