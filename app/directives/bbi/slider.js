define(['app', 'text!./slider.html','lodash','directives/bbi/ani-scroll'], function(app, templateHtml,_) { 'use strict';

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
                        items :[
                          {
                                        title: "About the Bio-Bridge Initiative",
                                        description: "Learn more about the purpose and main features of the Bio-Bridge Initiative",
                                        imageUrl: "/app/images/bbi/slider-bee.jpg",
                                        targetUrl: "/about"
                                    }, {
                                        title: "The Bio-Bridge Operational Framework",
                                        description: "Learn about the Bio-Bridge operational procedures, criteria and guidelines",
                                        imageUrl: "/app/images/bbi/slider-crab.jpg",
                                        targetUrl: "/about/framework"
                                    }, {
                                        title: "The Bio-Bridge tools and services",
                                        description: "Search technical and scientific cooperation records on the Platform",
                                        imageUrl: "/app/images/bbi/slider-flamingo.jpg",
                                        targetUrl: "/platform"
                                    }, {
                                        title: "Participation in the Bio-Bridge Initiative",
                                        description: "Learn more about ways in which one can participate in the Initiative",
                                        imageUrl: "/app/images/bbi/pic_3_opt.jpg",
                                        targetUrl: "/participation"
                                    }, {
                                        title: "The Bio-Bridge projects",
                                        description: "Learn more about technical and scientific cooperation projects facilitated through the Initiative",
                                        imageUrl: "/app/images/bbi/pic_2_opt.jpg",
                                        targetUrl: "/projects"
                                    }
                              ]
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
            },
            controller: function ($scope, $location) {
                //============================================================
                //
                //============================================================
                $scope.goTo = function (url) {

                        $location.path(url);

                };
            }
        };
    }]);

});
