define(['app', 'text!./menu-vert.html','providers/locale','ngSmoothScroll'], function(app, templateHtml) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('menuVert',["locale","$window",'smoothScroll',  function(locale,$window,smoothScroll) {
        return {
            restrict: 'E',
            template : templateHtml,
            scope: {
                links: '=links',
                pull: '@?',
                search: '@?',
            },
            link: function ($scope) {
              $scope.locale=locale;
            },
            controller: function ($scope, $location) {
                // ============================================================
                //
                // ============================================================
                $scope.goToLink = function (link) {
                    if(link.children.length===0) {
                        $window.location.href=link.source;
                    }
                };
                // ============================================================
                //
                // ============================================================
                $scope.textSearch = function (keywords) {

                      if(!keywords)return;
                      $location.path('/platform/search');
                      $location.replace();
                      $location.search('keywords',[keywords]);

                };
                // ============================================================
                //
                // ============================================================
                $scope.goTo = function (link,event) {

                  if(event)
                    event.preventDefault();

                    $location.path(link);

                };
            }
        };
    }]);

});
