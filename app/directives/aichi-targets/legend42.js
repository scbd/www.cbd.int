import app from '~/app'
import templateHtml from './legend42.html'
import '~/directives/aichi-targets/progress-pie'
import '~/directives/aichi-targets/national-targets-map'

    //============================================================
    //
    //============================================================
    app.directive('legend42', ['$window', function($window) {
        return {
            restrict: 'E',

            template: templateHtml,
            link: function($scope, $elem,$attrs, ctrls) {
                $scope.itemColor={color:false};
                $scope.clearSearch = function(){
                  $scope.searchNatTar='';
                };

            },

            controller: function($scope) {
              $scope.searchNatTar='';
              $scope.showMap=true;
              $scope.leggends = {
                aichiTarget: [{
                  id: -1,
                  title: 'No Data',
                  visible: true,
                  color: '#aaaaaa'
                }, 
                {
                  id: 0,
                  title: 'Unknow',
                  visible: true,
                  color: '#eee'
                },{
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