define(['app', 'text!./crumbs.html'], function(app, templateHtml) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('crumbs',  function() {
        return {
            restrict: 'E',
            template : templateHtml,
            link: function ($scope, elem, attrs) {
              $scope.carouselData=  {
                    items :[
                      {
                                title: "View Latest TSC Requests:",
                                    description: "Browse TSC requests from the Bio-Bridge Initiative community.",
                                    imageUrl: "/app/images/bbi/slider-sea-turtle.jpg",
                                    targetUrl: "/platform/bbi-request"
                                }, {
                                    title: "Our TSC Providers:",
                                    description: "See our TSC providers in the regions.",
                                    imageUrl: "/app/images/bbi/slider-insect.png",
                                    targetUrl: "/platform/bbi-profile"
                                }, {
                                    title: "View Latest TSC Opportunites:",
                                    description: "View our list of TSC opportunities to see which one is right for you.",
                                    imageUrl: "/app/images/bbi/slider-red-eye-tree-frog.jpg",
                                    targetUrl: "/platform/bbi-opportunity"
                                }, {
                                    title: "Proposals Awaiting Funding:",
                                    description: "Explore our vetted Bio-Bridge Initiative proposals.",
                                    imageUrl: "/app/images/bbi/slider-puzzle.jpg",
                                    targetUrl: "/platform/bbi-proposals"
                                }, {
                                    title: "Search for Tools:",
                                    description: "Browse a wide range of TSC tools from the resource library.",
                                    imageUrl: "/app/images/bbi/slider-bear.jpg",
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
