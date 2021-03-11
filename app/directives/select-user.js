import app from '~/app';
import html from './select-user.html';
import _ from 'lodash'; 

	export default app.directive('selectUser', ['$http', function($http) {
		return {
            require: 'ngModel',
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                role : '<role',
                options : '<extraOptions',
                caption : '@caption'
            },
			link: function ($scope, elem, y, ngModelCtrl) {

                var searchBox = elem.find("input");
                
                //==============================
                //
                //==============================
                $scope.selectUser = function(user) {
                    ngModelCtrl.$setViewValue(user);    
                };
                
                //==============================
                //
                //==============================
                $scope.getName = function(u) {
                    if(u.lastName) return u.firstName+' '+u.lastName;
                    if(u.name)     return u.name;
                    return u;
                };

                //==============================
                //
                //==============================
                $scope.focus = function() {
                    setTimeout(function() { 
                        searchBox.focus(); 
                        searchBox.select(); 
                    }, 100);
                };

                //==============================
                //
                //==============================
                $scope.searchUsers = function(text) {
                    
                    $scope.users = [];
                    
                    if(!text)
                        return;

                    $scope.searching = true;
                    
                    $http.get('/api/v2013/users', { params : { q: text, role: $scope.role, l: 25 }, cache: true }).then(function(res) {
                        $scope.users = res.data;
                    }).catch(console.error).finally(function(){
                        delete $scope.searching;
                    });
                };
			}
		};
	}]);

