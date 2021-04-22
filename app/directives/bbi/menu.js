import app from '~/app'
import templateHtml from './menu.html'
import _ from 'lodash'
import '~/providers/locale'

    //============================================================
    //
    //============================================================
    app.directive('menu',["locale","$window", '$location',  function(locale,$window, $location) {
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

                  import("~/js/slaask").then(function({default: _slaask }) {

                      if(!_slaask.initialized) {
                          _slaask.init('d611635fe9b46e439afb79833e255443');
                      }
                  });

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
