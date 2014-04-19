define(['angular', 'underscore'],
  function(angular, _) {
    return angular.module('app.directives', []).directive('gmap', ['$window',
      function($window) {
        var map, infowindow;


        function init(rootEl) {
          infowindow = new $window.google.maps.InfoWindow();

          map = new $window.google.maps.Map(rootEl, {
            zoom: 2,
            center: new $window.google.maps.LatLng(13.6036603, -101.313101),
            mapTypeId: $window.google.maps.MapTypeId.SATELLITE,
            mapTypeControlOptions: {
              mapTypeIds: [$window.google.maps.MapTypeId.SATELLITE]
            }
          });
        }

        function cleanupListeners(e) {
          $window.google.maps.event.removeListener(listener);
          $window.google.maps.event.clearInstanceListeners($window);
          $window.google.maps.event.clearInstanceListeners($window.document);
          $window.google.maps.event.clearInstanceListeners(map);
        }

        return {
          restrict: 'EA',
          template: '<div id="map"></div>',
          replace: true,
          scope: {},
          link: function(scope, element, attrs) {
            require(['async!http://maps.google.com/maps/api/js?v=3.exp&sensor=false'], function(maps) {
              init(element.get(0));
              scope.$on('$destroy', cleanupListeners);
            });
          }
        };

      }
    ]);
  });