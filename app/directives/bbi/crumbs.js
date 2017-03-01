define(['app', 'text!./crumbs.html'], function(app, templateHtml) { 'use strict';

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
                    items :[
                      {
                                title: "Requests for Assistance",
                                    description: "Browse the latest requests for assistance",
                                    imageUrl: "/app/images/bbi/slider-sea-turtle.jpg",
                                    targetUrl: "/platform/bbi-request"
                                }, {
                                    title: "Technical Assistance Providers",
                                    description: "Browse the profiles of technical assistance providers registered with BBI",
                                    imageUrl: "/app/images/bbi/slider-insect.png",
                                    targetUrl: "/platform/bbi-profile"
                                }, {
                                    title: "Latest TSC Opportunities",
                                    description: "View the list of new TSC opportunities currently available",
                                    imageUrl: "/app/images/bbi/pic_1_opt.jpg",
                                    targetUrl: "/platform/bbi-opportunity"
                                }, {
                                    title: "TSC project proposals",
                                    description: "Browse vetted TSC proposals awaiting funding support",
                                    imageUrl: "/app/images/bbi/slider-hands.jpg",
                                    targetUrl: "/platform/bbi-proposals"
                                }, {
                                    title: "TSC Resources",
                                    description: "Browse TSC tools, resources and initiatives",
                                    imageUrl: "/app/images/bbi/slider-flower.jpg",
                                    targetUrl: "/platform/tools"
                                }
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
