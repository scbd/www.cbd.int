define(['app', 'text!./menu.html','lodash','providers/locale'], function(app, templateHtml,_) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('menu',["locale","$window",  function(locale,$window) {
        return {
            restrict: 'E',
            template : templateHtml,
            scope: {
                links: '=links',
                pull: '@?',
                search: '@?',
                user:'='
            },
            link: function ($scope) {
              $scope.locale=locale;

                  require(["js/slaask"], function(_slaask) {

                      if(!_slaask.initialized) {
                          _slaask.init('d611635fe9b46e439afb79833e255443');
                      }
                  });


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
