import app from '~/app'
import template from './pagination.html'
     
    app.directive('pagination', [function() {
        return {
            restrict: 'E',
            template: template,
            scope: {
                currentPage:'=',
                itemsPerPage:'=',
                filtered :'=',
                search :'=',
                pages   :'=',
                count:'=',
                onPage:'&',
                paginationSize: '@?'
            },

            controller: ['$scope', function($scope) {
                function getPageCount(){
                  return Math.ceil($scope.count/($scope.itemsPerPage||3));
                }
                $scope.getPageCount =getPageCount;
            }],
        }; // return
    }]);