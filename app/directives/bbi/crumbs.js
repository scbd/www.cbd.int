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
                                title: "Latest Requests for Assistance",
                                    description: "Browse the latest requests for assistance submitted by Parties and relevant stakeholders",
                                    imageUrl: "/app/images/bbi/slider-sea-turtle.jpg",
                                    targetUrl: "/platform/bbi-request"
                                }, {
                                    title: "Technical Assistance Providers",
                                    description: "Browse the profiles of technical assistance providers that are registered with BBI",
                                    imageUrl: "/app/images/bbi/slider-insect.png",
                                    targetUrl: "/platform/bbi-profile"
                                }, {
                                    title: "Latest TSC Opportunities",
                                    description: "View the list of new TSC opportunities currently available",
                                    imageUrl: "/app/images/bbi/slider-red-eye-tree-frog.jpg",
                                    targetUrl: "/platform/bbi-opportunity"
                                }, {
                                    title: "TSC proposals awaiting funding",
                                    description: "Explore TSC proposals vetted by the BBI Project Review Committee and are awaiting funding support",
                                    imageUrl: "/app/images/bbi/slider-hands.jpg",
                                    targetUrl: "/platform/bbi-proposals"
                                }, {
                                    title: "TSC tools, resources and initiatives",
                                    description: "Browse a wide range of TSC tools and resources available through our virtual library as well as completed and ongoing TSC initiatives",
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
