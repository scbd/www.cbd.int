/*jshint unused:false*/
define(['./module.js', 'underscore', 'text!../data/reports/countries.geojson', '../util/colors.js'],
  function(module, _, countriesGeoJson, colors) {
    return module.directive('gmap', ['$window', 'reports', '$rootScope',
      function($window, reports, $rootScope) {
        var map,
          infowindow,
          defaultStyle = {
            strokeColor: null,
            strokeOpacity: 0.75,
            strokeWeight: 1,
            fillColor: null,
            fillOpacity: 0.25
          },
          geojsonCache = JSON.parse(countriesGeoJson);

        // array for gmap listeners that we can clean
        // when the directive is destoryed.
        this.listeners = [];

        function init(rootEl) {
          infowindow = new $window.google.maps.InfoWindow();

          map = new $window.google.maps.Map(rootEl, {
            zoom: 1,
            center: new $window.google.maps.LatLng(0, 0),
            mapTypeId: $window.google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
              mapTypeIds: [$window.google.maps.MapTypeId.ROADMAP]
            }
          });
        }

        function setInfoWindow(event) {
          var content = '<div id="infoBox" class="scrollFix">',
            key;

          event.feature.forEachProperty(function(propVal, propName) {
            if (propName === 'NAME') {
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


        function displayRegion(regionData) {
          map.data.addGeoJson(regionData);
          this.listeners.push(map.data.addListener('click', setInfoWindow));
          applyStyles();
        }

        function applyStyles() {
          map.data.setStyle(function(feature) {
            var strokeColor = colors.randomHexColor();
            return {
              strokeColor: strokeColor,
              fillColor: colors.changeLuminance(strokeColor, 0.1)
            };
          });
        }


        function cleanupListeners(e) {
          // $window.google.maps.event.removeListener(listener);
          angular.forEach(this.listeners, function(l) {
            $window.googlemaps.event.removeListener(l);
          });
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
            require(['async!//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function(a, maps) {
              init(element.get(0));
              scope.$on('$destroy', cleanupListeners);
            });

            $rootScope.$on('updateMap', function(e, newReports) {
              clearMap(map);
              angular.forEach(newReports, function(report) {
                console.log(report);
                var countryCode = report.government_s.toUpperCase();
                var shape = _.find(geojsonCache.features, function(feature) {
                  return feature.properties.iso_a2 === countryCode;
                });
                displayRegion(shape);
              });
            });

            $rootScope.$on('resetCenterZoom', function() {
              console.log('reset');
              map.setCenter(new $window.google.maps.LatLng(0,0));
              map.setZoom(1);
            });
          }
        };

      }
    ]);
  });