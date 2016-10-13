define(['app', 'text!./legend42.html','directives/aichi-targets/progress-pie','directives/aichi-targets/national-targets-map'], function(app, templateHtml) {
    'use strict';

    //============================================================
    //
    //============================================================
    app.directive('legend42', ['$window', function($window) {
        return {
            restrict: 'E',

            template: templateHtml,
            link: function($scope, $elem,$attrs, ctrls) {

                $scope.itemColor={color:false};
            },

            controller: function($scope) {
              $scope.leggends = {
                aichiTarget: [{
                  id: 0,
                  title: 'No Data',
                  visible: true,
                  color: '#aaaaaa'
                }, {
                  id: 1,
                  title: 'Moving Away',
                  visible: true,
                  color: '#6c1c67'
                }, {
                  id: 2,
                  title: 'No Progress',
                  visible: true,
                  color: '#ee1d23'
                }, {
                  id: 3,
                  title: 'Insufficient Rate',
                  visible: true,
                  color: '#fec210'
                }, {
                  id: 4,
                  title: 'Met Target',
                  visible: true,
                  color: '#109e49'
                }, {
                  id: 5,
                  title: 'Exceeded Target',
                  visible: true,
                  color: '#1074bc'
                }, ]};

            }
        };
    }]);

});