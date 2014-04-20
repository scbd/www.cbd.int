/*jshint unused:false*/
var g_reports;
define(['angular', 'underscore'],
  function(angular, _) {
    return angular.module('app.directives', []).directive('gmap', ['$window', 'reports',
      function($window, reports) {
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

        function setInfoWindow(event) {
          var content = '<div id="infoBox" class="scrollFix">',
            key,
            CBDbaseUrl = 'https://chm.cbd.int/database/record?documentID=',
            ebsaID = event.feature.getProperty('KEY');

          event.feature.forEachProperty(function(propVal, propName) {
            if (propName == 'NAME') {
              content += '<strong>' + propVal + '</strong><br /><br />';
            } else if (_.indexOf(['KEY', 'style', 'WORKSHOP'] !== -1)) {
              return;
            } else {
              content += propName + ': ' + propVal + '<br /><br />';
            }
          });

          content += '<a class="pull-right" target="_blank" href="' + CBDbaseUrl + ebsaID + '">Details »</a>';
          content += '</div>';
          infowindow.setContent(content);
          infowindow.setPosition(event.latLng);
          infowindow.open(map);
        }


        function clearMap(map) {
          if (infowindow.getMap()) infowindow.close();
          map.data.forEach(function(feature) {
            map.data.remove(feature);
          });
        }


        function displayRegion(regionData, color) {
          map.data.addGeoJson(regionData);
          listeners.push(map.data.addListener('click', setInfoWindow));
        }

        function applyStyles() {
          map.data.setStyle(function(feature) {
            return angular.extend({}, defaultStyle, feature.getProperty('style'));
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

              g_reports = reports;
            });
          }
        };

      }
    ]);
  });