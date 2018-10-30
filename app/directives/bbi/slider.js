define(['app', 'text!./slider.html','lodash','json!https://attachments.cbd.int/bbi-slider.json','directives/bbi/ani-scroll'], function(app, templateHtml,_,bbiSlider) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('slider',['$window', function($window) {
        return {
            restrict: 'E',
            template : templateHtml,
            link: function ($scope, $element) {
              $(document).ready(function() {
                       $('.carousel').carousel({
                           interval: 4000
                       });
                       angular.element(document).on('scroll', _.debounce(doOnScroll, 500));

            });

            function doOnScroll(e) {

              var testEl = $element.find("#carousel-generic");
              // console.log(e.originalEvent);
            }

                  $scope.carouselData=  {
                        items :bbiSlider
                      };
            //           angular.element($window).bind('scroll', function() {
            //
            //               var offset = $scope.getScrollOffsets($window);
            //               if (offset.y >= 50)
            //
            // console.log($element.find('.carousel-inner').addClass('slider-height'));
            //               $scope.$apply();
            //           });
                      $scope.getScrollOffsets = function(w) {

                          // Use the specified window or the current window if no argument
                          w = w || window;

                          // This works for all browsers except IE versions 8 and before
                          if (w.pageXOffset !== null) {
                              return {
                                  x: w.pageXOffset,
                                  y: w.pageYOffset
                              };
                          }

                          // For IE (or any browser) in Standards mode
                          var d = w.document;
                          if (document.compatMode === 'CSS1Compat') {
                              return {
                                  x: d.documentElement.scrollLeft,
                                  y: d.documentElement.scrollTop
                              };
                          }

                          // For browsers in Quirks mode
                          return {
                              x: d.body.scrollLeft,
                              y: d.body.scrollTop
                          };
                      };
                      $scope.getPosition = function(e) {
                          return {
                              x: e[0].offsetLeft,
                              y: e[0].offsetTop
                          };
                      };
                      $scope.getViewPortSize = function(w) {

                          return {
                              x: Math.max(document.documentElement.clientWidth, w.innerWidth || 0),
                              y: Math.max(document.documentElement.clientHeight, w.innerHeight || 0)
                          }


                      };

            }
        };
    }]);

});
