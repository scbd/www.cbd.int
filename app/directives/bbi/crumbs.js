import app from '~/app'
import templateHtml from './crumbs.html'
import slider       from '~/data/bbi/bbi-platform-carousel.json'

    //============================================================
    //
    //============================================================
    app.directive('crumbs',  function() {
        return {
            restrict: 'E',
            template : templateHtml,
            link: function ($scope, elem, attrs) {
              $(document).ready(function() {
                       $('.carousel').carousel({
                           interval: 4000
                       });
            });
              $scope.carouselData=  {
                    items :slider
                  };

            }
        };
    });