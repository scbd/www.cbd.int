define(['app', 'text!./slider.html'], function(app, templateHtml) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('slider', function() {
        return {
            restrict: 'E',
            template : templateHtml,
            link: function ($scope, $elem, attrs) {
              $(document).ready(function() {
                       $('.carousel').carousel({
                           interval: 4000
                       });
            });
                  $scope.carouselData=  {
                        items :[
                          {
                                        title: "BBI Web Platform Launched",
                                        description: "Browse, request or provide TSC services.",
                                        imageUrl: "/app/images/bbi/slider-bee.jpg",
                                        targetUrl: "/platform"
                                    }, {
                                        title: "Join the Discussion",
                                        description: "Come discuss the role of BBI in promoting TSC.",
                                        imageUrl: "/app/images/bbi/slider-crab.jpg",
                                        targetUrl: "/forums/bbi"
                                    }, {
                                        title: "Search TSC Information :",
                                        description: "Search TSC records on the Platform.",
                                        imageUrl: "/app/images/bbi/slider-flamingo.jpg",
                                        targetUrl: "/platform/search"
                                    }
                                    // , {
                                    // //    title: "Proposals Awaiting Funding:",
                                    // //    description: "Explore our vetted Bio-Bridge Initiative proposals.",
                                    //     imageUrl: "/app/images/bbi/slider-flower.jpg",
                                    //     targetUrl: "/platform/bbi-proposals"
                                    // }, {
                                    // //    title: "Search for Tools:",
                                    // //    description: "Browse a wide range of TSC tools from the resource library.",
                                    //     imageUrl: "/app/images/bbi/slider-hands.jpg",
                                    //     targetUrl: "/platform/tools"
                                    // }
                              ]
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
    });

});
