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

            },
            controller: function ($scope, $location) {
                //============================================================
                //
                //============================================================
                $scope.goTo = function (url) {
                  try {
                    (new URL(url)).hostname 
                    window.open(url,"_blank")
                  } catch(errr){           
                    $location.path(url);
                  }
                };
            }
        };
    });

});
