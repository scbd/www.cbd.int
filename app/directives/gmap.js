define(['app', 'underscore', '../util/colors.js'],
  function(module, _, colors) {
    return module.directive('gmap', ['$window', 'reports', '$rootScope', '$http', '$q',
      function($window, reports, $rootScope, $http, $q) {
        var map,
          infowindow,
          defaultStyle = {
            strokeColor: null,
            strokeOpacity: 0.75,
            strokeWeight: 1,
            fillColor: null,
            fillOpacity: 0.25
          },
          defaultCountryColor = '#DDDDDD';

        var geojsonCache = $http.get('/app/data/reports/countries.geojson').then(function(res){
            geojsonCache = res.data;
        });

        // array for gmap listeners that we can clean
        // when the directive is destoryed.
        this.listener = null;

        function init(rootEl) {
          infowindow = new $window.google.maps.InfoWindow({
            minWidth: 100,
            maxWidth: 360
          });

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
          var content = '<div id="infoBox" class="infobox scrollFix">';

          var reports = event.feature.getProperty('reports');
          angular.forEach(reports, function(report) {
            content += '<strong>' + report.title + '</strong><br/>';
            if (report.assessment) {
              content += '<strong>Progress:</strong> ' +
                '<div class="color-box" style="background-color: ' +
                  report.assessment.meta.color +
                ';"></div>';
            }
            if (report.summary) {
              content += '<p class="infobox-summary">' + report.summary + '</p>';
            }

            content += '<div class="clearfix"></div>';
            content += '<a class="pull-right" target="_blank" href="' + report.reportUrl + '">View Report »</a>';
            content += '<hr class="infobox-hr">';
          });

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
          applyStyles();
        }

        function applyStyles() {
          map.data.setStyle(function(feature) {
            var strokeColor = feature.getProperty('color');
            if (!strokeColor) strokeColor = defaultCountryColor;
            return {
              strokeColor: colors.changeLum(strokeColor, -0.35),
              fillColor: colors.changeLum(strokeColor, -0.35)
            };
          });
        }


        function cleanupListeners() {
          // This seems a little heavy handed for cleanup but
          // gmaps has known bugs with memory leaks.
          $window.google.maps.event.removeListener(this.listener);
          //$window.google.maps.event.clearInstanceListeners(infowindow);
          $window.google.maps.event.clearInstanceListeners($window);
          $window.google.maps.event.clearInstanceListeners($window.document);
          $window.google.maps.event.clearInstanceListeners(map);
        }

        function updateMap(e, newReports) {

            var _this = this;

            $q.when(geojsonCache).then(function(geojsonCache){

              cleanupListeners();
              clearMap(map);
              var groupedReports = _.groupBy(newReports, 'countryCode');

              angular.forEach(groupedReports, function(reports, countryCode) {

                if (countryCode === 'EUR') return;

                var shape = _.find(geojsonCache.features, function(feature) {
                  return feature.properties.iso_a2 === countryCode;
                });

                var countryColor,
                  bestAssess = _.max(reports, function(report) {
                    return report.assessment && report.assessment.meta.score;
                  });

                if (!_.isEmpty(bestAssess)) countryColor = bestAssess.assessment.meta.color;

                var shapeClone = angular.copy(shape);

                shapeClone.properties.reports = reports;
                shapeClone.properties.color = countryColor;

                displayRegion(shapeClone);
              });

              _this.listener = map.data.addListener('click', setInfoWindow);

            });

        }

        function resetMap() {
          map.setCenter(new $window.google.maps.LatLng(0, 0));
        }

        return {
          restrict: 'EA',
          template: '<div id="map"></div>',
          replace: true,
          scope: {},
          link: function(scope, element) {
            require(['async!//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function() {
              init(element.get(0));
              scope.$on('$destroy', cleanupListeners);
            });

            $rootScope.$on('updateMap', updateMap);
            $rootScope.$on('resetCenter', resetMap);
          }
        };

      }
    ]);
  });
