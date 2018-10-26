define(['app', 'text!./crumbs.html','json!https://attachments.cbd.int/bbi-platform-carousel.json'], function(app, templateHtml, slider) { 'use strict';

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

});
