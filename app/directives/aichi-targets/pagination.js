define(['text!./pagination.html', 'app'], function(template, app) {
    'use strict';
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
                onPage:'&'
            },

            controller: ['$scope', function($scope) {
                function getPageCount(){
                  return Math.ceil($scope.count/3);
                }
                $scope.getPageCount =getPageCount;
            }],
        }; // return
    }]);
}); // define