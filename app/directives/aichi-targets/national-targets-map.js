define(['app', 'lodash',
'text!./national-targets-map.html',
'text!./target.html',
'text!./target-row.html',
'ammap',
'shim!directives/reporting-display/worldEUHigh[ammap]',
'shim!ammap/themes/light[ammap]'
], function(app,_,template,targetTemplate,row) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('nationalTargetsMap',['$interpolate','$timeout',  function($interpolate,$timeout) {
        return {
            restrict: 'E',
            require:'nationalTargetsMap',
            template : template,
            scope: {
                aichiTarget: '=aichiTarget',
                legendHide:'&',
                itemColor: '=',
                searchTarget:'=',
                showMap:'=',
                countries:'='
            },
            link: function ($scope, $elem, $attrs,selfCtrl) {
              $scope.$watch('itemColor',function(){
                if($scope.itemColor && $scope.itemColor.color){

                  $scope.legendHide($scope.itemColor);
                }
              },true);

              var initWatch = $scope.$watch('countries',function(newVal){
                if(!newVal || !newVal.length) return
                initWatch();
                selfCtrl.init();

              },true);

              
            },
            controller: function ($scope) {


                //============================================================
                //
                //============================================================
                function init() {
                    $scope.showMap = true;
                    $scope.selectedCountry={};

                    initMap();
                    writeMap();
                    generateMap();

                }
                this.init = init;

                function initMap() {
                  $scope.mapData = {
                    "type": "map",
                    "theme": "light",
                    "zoomDuration":0.1,
                    "responsive": {
                      "enabled": true
                    },
                    "balloon": {
                      "adjustBorderColor": true,
                      "maxWidth":500
                    },
                    "dataProvider": {
                      "map": "worldEUHigh",
                      "getAreasFromMap": true,
                      "images": [{
                        "label": "EU",
                        "latitude": -5.02,
                        "longitude": -167.66
                      }],
                    },
                    "areasSettings": {

                      "autoZoom": true,
                      "selectedColor": "#4eba7d",
                      "rollOverColor": "#423f3f",
                      "selectable": true,
                      "color": "#aaaaaa",
                    },
                    "zoomControl": {
                		"zoomControlEnabled": true,
                    "right": 10
                	  }

                  }; //
                } 

    
                function generateMap() {

                    progressColorMap(aichiMap);
                } 
  
                function aichiMap(country) {

                  if(!_.isEmpty(country.docs))
                      changeAreaColor(country.code, country.docs[0].progressColor);
                  
                  if(!_.isEmpty(country.targets))
                      buildTargetBaloon(country);
                  
                } 

                function hideAreas(color) {
                  // Walkthrough areas
                  if (!color) color = '#aaaaaa';
                  _.each($scope.map.dataProvider.areas, function(area) {
                    if (area.id !== 'divider1') {
                      area.colorReal = area.originalColor = color;
                      area.mouseEnabled = true;
                      area.balloonText = '[[title]]';
                    }
                  });
                } 
                
                $scope.legendHide = function(legendItem) {

                  _.each($scope.map.dataProvider.areas, function(area) {
                      if (legendItem.color === area.originalColor && area.mouseEnabled === true) {
                        area.colorReal = '#a3ccff';
                        area.mouseEnabled = false;

                      } else if (legendItem.color === area.originalColor && area.mouseEnabled === false) {
                        area.colorReal = legendItem.color;
                        area.mouseEnabled = true;
                      }
                  });

                  $scope.map.validateData();
                }

                function writeMap() {
                  $scope.map = AmCharts.makeChart("mapdiv", $scope.mapData); //jshint ignore:line
                  $scope.map.write("mapdiv");
                  $scope.map.validateData();
                  $scope.map.addListener("clickMapObject", function(event) {

                     $scope.selectedCountry=_.find($scope.countries,{'code':event.mapObject.id});

                     $timeout(function(){$scope.showMap= false;});

                  });
                }

                function progressColorMap(mapTypeFunction) {

                  hideAreas();
                  // $scope.legendTitle = ""; // rest legend title
                  _.each($scope.countries, function(country) {

                      mapTypeFunction(country);

                  });
                  $scope.map.validateData(); // updates map with color changes
                } 

                function getMapObject(id) {

                  var index = _.findIndex($scope.map.dataProvider.areas, function(area) {
                    return area.id === id.toUpperCase();
                  });
                  return $scope.map.dataProvider.areas[index];
                } //getMapObject

                function changeAreaColor(id, color, area) {
                    if (!area)
                      area = getMapObject(id.toUpperCase());

                    area.colorReal = area.originalColor = color;
                    if (id.toUpperCase() === 'DK') {
                      var areaA = getMapObject('GL');
                      areaA.colorReal = area.colorReal;
                      areaA.originalColor = area.originalColor;
                      var areaB = getMapObject('FO');
                      areaB.colorReal = area.colorReal;
                      areaB.originalColor = area.originalColor;
                    }
                    if (area.id.toUpperCase() === 'NO') {
                      var areaC = getMapObject('SJ');
                      areaC.colorReal = area.colorReal;
                      areaC.originalColor = area.originalColor;
                    }
                    if (area.id.toUpperCase() === 'MA') {
                      var areaD = getMapObject('EH');
                      areaD.colorReal = area.colorReal;
                      areaD.originalColor= area.originalColor;
                    }
                    if(area.id.toUpperCase()==='CN'){
                      var areaE = getMapObject('TW');
                      areaE.colorReal = area.colorReal;
                      areaE.originalColor = area.originalColor;
                    }
                } 

                function buildTargetBaloon(country) {

                    var area = getMapObject(country.code);
                    $scope.country=country;
                    $scope.rows = '';

                    if(country.targets.length<=1) $scope.hideS='hide';

                    _.each(country.targets,function(t){
                          if(t.isAichiTarget_b) t.hideTarget='hide';
                          else t.hideIcon='hide';
                          t.aichiTarget=$scope.aichiTarget;

                          $scope.rows = $scope.rows + $interpolate(row)(t);

                    });
                    area.balloonText = $interpolate(targetTemplate)($scope);
                    $scope.rows = '';
                    delete($scope.hideS);

                } 
            }
        };
    }]);

});