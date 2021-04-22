import app from '~/app';
import html from './internal-comments.html';
import _ from 'lodash';
import '~/filters/initials';
import '~/filters/moment'; 

	export default app.directive('internalComments', ['$http', '$rootScope', function($http, $rootScope) {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                type : '@type',
                resources : '<resources',
                canEdit: '<canEdit'
            },
			link: function ($scope) {
                
                $scope.user = $rootScope.user;
                $scope.comments = [];
                $scope.postComment   = postComment;
                $scope.deleteComment = deleteComment;
                
                var loadCommentsDebounced = _.debounce(loadComments, 100);
                
                $scope.$watch('type', loadCommentsDebounced);
                $scope.$watchCollection('resources', loadCommentsDebounced);
                
                //===========================
                //
                //===========================
                function loadComments() {

                    var type      = $scope.type;
                    var resources = _.compact($scope.resources);
                    
                    if(!type)             { return; }
                    if(!resources.length) { return; }

                    return $http.get('/api/v2017/comments', { params : { q: { type: type, resources: { $all: resources } } } }).then(function(res){

                        $scope.comments = res.data;

                    }).catch(console.error);
                }                
                
                //===========================
                //
                //===========================
                function postComment(text) {

                    text = (text||'').trim();

                    if(!text) return;
                    
                    var type      = $scope.type;
                    var resources = _.compact($scope.resources);
                    
                    if(!type)             throw new Error("no type specified");
                    if(!resources.length) throw new Error("no resources specified");

                    var comment = {
                        type: type,
                        resources: resources,
                        text: text
                    };

                    return $http.post('/api/v2017/comments', comment).then(function(){

                        notify();
                        
                        return loadComments();

                    }).catch(console.error);
                }        

                //===========================
                //
                //===========================
                function deleteComment(id) {

                    return $http.delete('/api/v2017/comments/'+id).then(function(){
                        
                        notify();
                        
                        return loadComments();

                    }).catch(console.error);
                }
                
                //===========================
                //
                //===========================
                function notify() {
                    $scope.$emit("comments", {
                        type: $scope.type, 
                        resources: _.compact($scope.resources) || [],
                        comments: $scope.comments || [],
                    });
                }
			}
		};
	}]);

