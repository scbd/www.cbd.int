define(['app', 'lodash', 'text!./national-targets-map.html',
'ammap',
'shim!directives/reporting-display/worldEUHigh[ammap]',
'shim!ammap/themes/light[ammap]',
'providers/locale'
], function(app,_,template) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('nationalTargetsMap',['$http','$q','locale',  function($http,$q,locale) {
        return {
            restrict: 'E',
            require:'nationalTargetsMap',
            template : template,
            scope: {
                aichiTarget: '=aichiTarget',
            },
            link: function ($scope, $elem, $attrs,selfCtrl) {
              $scope.leggends = {
                aichiTarget: [{
                  id: 0,
                  title: 'No Data',
                  visible: true,
                  color: '#aaaaaa'
                }, {
                  id: 1,
                  title: 'Moving Away',
                  visible: true,
                  color: '#6c1c67'
                }, {
                  id: 2,
                  title: 'No Progress',
                  visible: true,
                  color: '#ee1d23'
                }, {
                  id: 3,
                  title: 'Insufficient Rate',
                  visible: true,
                  color: '#fec210'
                }, {
                  id: 4,
                  title: 'Met Target',
                  visible: true,
                  color: '#109e49'
                }, {
                  id: 5,
                  title: 'Exceeded Target',
                  visible: true,
                  color: '#1074bc'
                }, ]};
            selfCtrl.init();
            },
            controller: function ($scope, $location) {


                //============================================================
                //
                //============================================================
                function init() {

                    $q.all([loadCountries(), query()])
                      .then(function(){
                        groupByCountry();
                        initMap();
                        writeMap();
                        generateMap();
                      });
                    //
                }
                this.init = init;

                //=======================================================================
                //
                //=======================================================================
                function initMap() {
                  $scope.mapData = {
                    "type": "map",
                    "theme": "light",
                    "responsive": {
                      "enabled": true
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
                    // "smallMap": {},
                    // "export": {
                    //   "libs": { "autoLoad": false},
                    //   "enabled": true,
                    //   "position": "bottom-right"
                    // },
                  }; //
                } //$scope.initMap
                //=======================================================================
                //
                //=======================================================================
                function generateMap() {

                    progressColorMap(aichiMap);
                } //$scope.legendHide

                //=======================================================================
                //
                //=======================================================================
                function restLegend(legend) {

                  _.each(legend, function(legendItem) {
                    legendItem.visible = true;
                  });
                } //$scope.legendHide

                //=======================================================================
                //
                //=======================================================================
                function progressToNumber(progress) {

                  switch (progress.trim()) {
                    case "On track to exceed target":
                      return 5;
                    case "On track to achieve target":
                      return 4;
                    case "Progress towards target but at an  insufficient rate":
                      return 3;
                    case "No significant change":
                      return 2;
                    case "Moving away from target":
                      return 1;
                  }
                } //progressToNumber(progress)
                //============================================================
                //
                //============================================================
                function queryText() {
                    var targetText = '';
                    if ($scope.aichiTarget < 10)
                        targetText = 'AICHI-TARGET-0' + $scope.aichiTarget;
                    else
                        targetText = 'AICHI-TARGET-' + $scope.aichiTarget;

                    var query = 'NOT version_s:* AND realm_ss:chm-dev AND schema_s:nationalAssessment AND nationalTarget_EN_t:"' + targetText + '" AND _latest_s:true AND _state_s:public';
                    return query;
                }


                //=======================================================================
                //
                //=======================================================================
                function query() {

                    var queryParameters = {
                        'q': queryText(),
                        'sort': 'createdDate_dt desc, title_t asc',
                        'fl': 'reportType_s,documentID,identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t,_latest_s,nationalTarget_EN_t,progress_EN_t,year_i,text_EN_txt,nationalTarget_EN_t,government_s',
                        'wt': 'json',
                        'start': 0,
                        'rows': 1000000,
                    };

                    return $http.get('/api/v2013/index/select', {
                        params: queryParameters,
                        cache: true
                    }).success(function(data) {
                        $scope.count = data.response.numFound;
                        $scope.documents = data.response.docs;
                    });
                } // query


                //=======================================================================
                //
                //=======================================================================
                function loadCountries() {

                    return $http.get('/api/v2015/countries', {
                        cache: true,
                    }).then(function(res) {
                        _.each(res.data, function(c) {
                            c.name = c.name[locale];
                        });
                        $scope.countries = res.data;
                    });
                }

                //=======================================================================
                //
                //=======================================================================
                function aichiMap(country) {


                  if(_.isEmpty(country.docs)) return;

                  changeAreaColor(country.code, progressToColor(progressToNumber(country.docs[0].progress_EN_t)));
                  buildProgressBaloon(country, progressToNumber(country.docs[0].progress_EN_t), country.docs[0].nationalTarget_EN_t);
                  legendTitle(country);
                  restLegend($scope.leggends.aichiTarget);
                } // aichiMap
                //=======================================================================
                function legendTitle(country) {
                    $scope.legendTitle = aichiTargetReadable(country.docs[0].nationalTarget_EN_t) + "Progress";
                } //legendTitle
                //=======================================================================
                //
                //=======================================================================
                function groupByCountry() {
                  var country=null;
                  _.each($scope.documents, function(doc) {
                      country=null;
                      country = _.find($scope.countries,{code:doc.government_s.toUpperCase()});
                      if(!country) throw 'Error: assessment has no country';
                      if(!country.docs)
                        country.docs = []; // initializes the countries docs

                      country.docs.push(doc);

                      if (country.docs.length > 1)
                      country.docs.sort(
                        function(a, b) {
                          if (b.date_dt && a.date_dt) return new Date(b.date_dt) - new Date(a.date_dt);
                        }); // sort by date
                        if (country.docs.length > 1)
                      country.docs.sort(function(a, b) {
                        if (b.progress_EN_t && a.progress_EN_t)
                          return progressToNum(b.progress_EN_t) - progressToNum(a.progress_EN_t);
                      }); // sort sort by progress
                  });
                } //r
                //=======================================================================
                //
                //=======================================================================
                function progressToNum(progress) {

                  switch (progress.trim()) {
                    case "On track to exceed target":
                      return 5;
                    case "On track to achieve target":
                      return 4;
                    case "Progress towards target but at an  insufficient rate":
                      return 3;
                    case "No significant change":
                      return 2;
                    case "Moving away from target":
                      return 1;
                  }
                } //

                // //=======================================================================
                // // changes color of all un colored areas
                // //=======================================================================
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
                } //hideAreas(color)
                //=======================================================================
                //
                //=======================================================================
                $scope.legendHide = function(legendItem) {
                  var area2 = {};


                  _.each($scope.map.dataProvider.areas, function(area) {

                    if (area.id.toUpperCase() === 'DK') {
                      area2 = getMapObject('gl');
                      //area2.originalColor = area.originalColor;
                      area2.colorReal = area.colorReal;
                      area2.mouseEnabled = area.mouseEnabled;


                      if (area.id.toUpperCase() === 'FO') {
                        area2 = getMapObject('gl');
                        //area2.originalColor = area.originalColor;
                        area2.colorReal = area.colorReal;
                        area2.mouseEnabled = area.mouseEnabled;

                      }
                    }
                    if (area.id.toUpperCase() === 'NO') {
                      area2 = getMapObject('sj');
                      //area2.originalColor = area.originalColor;
                      area2.colorReal = area.colorReal;
                      area2.mouseEnabled = area.mouseEnabled;
                    }
                    if (area.id.toUpperCase() === 'MA') {
                      area2 = getMapObject('eh');
                      //area2.originalColor = area.originalColor;
                      area2.colorReal = area.colorReal;
                      area2.mouseEnabled = area.mouseEnabled;
                    }
                    if (area.id.toUpperCase() === 'CN') {
                      area2 = getMapObject('tw');
                      //area2.originalColor = area.originalColor;
                      area2.colorReal = area.colorReal;
                      area2.mouseEnabled = area.mouseEnabled;
                    }




                    if (legendItem.color === area.originalColor && area.mouseEnabled === true) {
                      area.colorReal = '#FFFFFF';
                      area.mouseEnabled = false;

                    } else if (legendItem.color === area.originalColor && area.mouseEnabled === false) {
                      area.colorReal = legendItem.color;
                      area.mouseEnabled = true;

                    }
                  });
                  if (legendItem.visible)
                    legendItem.visible = false;
                  else
                    legendItem.visible = true;
                  $scope.map.validateData();
                }; //$scope.legendHide

                //=======================================================================
                //
                //=======================================================================
                function toggleLegend(legend, color) { //jshint ignore:line

                  var index = _.findIndex(legend, function(legendItem) {
                    return legendItem.color == 'color';
                  });
                  legend[index].visible = false;
                } //toggleLeggend

                // =======================================================================
                //
                // =======================================================================
                function writeMap() {
                  $scope.map = AmCharts.makeChart("mapdiv", $scope.mapData); //jshint ignore:line
                  $scope.map.write("mapdiv");
                  $scope.map.validateData();
                } // writeMap

                //=======================================================================
                //
                //=======================================================================
                function progressColorMap(mapTypeFunction) {

                  hideAreas();
                  $scope.legendTitle = ""; // rest legend title
                  _.each($scope.countries, function(country) {

                      mapTypeFunction(country);

                  });
                  $scope.map.validateData(); // updates map with color changes
                } //progressColorMap

                // //=======================================================================
                // //
                // //=======================================================================
                function getMapObject(id) {

                  var index = _.findIndex($scope.map.dataProvider.areas, function(area) {
                    return area.id === id.toUpperCase();
                  });
                  return $scope.map.dataProvider.areas[index];
                } //getMapObject

                //=======================================================================
                //
                //=======================================================================
                function progressToColor(progress) {

                  switch (progress) {
                    case 5:
                      return '#1074bc';
                    case 4:
                      return '#109e49';
                    case 3:
                      return '#fec210';
                    case 2:
                      return '#ee1d23';
                    case 1:
                      return '#6c1c67';
                  }
                } //readQueryString

                //=======================================================================
                //
                //=======================================================================
                function getProgressText(progress, target) {

                  switch (progress) {
                    case 1:
                      return 'Moving away from ' + aichiTargetReadable(target) + ' (things are getting worse rather than better).';
                    case 2:
                      return 'No significant overall progress towards ' + aichiTargetReadable(target) + ' (overall, we are neither moving towards the ' + aichiTargetReadable(target) + ' nor moving away from it).';
                    case 3:
                      return 'Progress towards ' + aichiTargetReadable(target) + ' but at an insufficient rate (unless we increase our efforts the ' + aichiTargetReadable(target) + ' will not be met by its deadline).';
                    case 4:
                      return 'On track to achieve ' + aichiTargetReadable(target) + ' (if we continue on our current trajectory we expect to achieve the ' + aichiTargetReadable(target) + ' by 2020).';
                    case 5:
                      return 'On track to exceed ' + aichiTargetReadable(target) + ' (we expect to achieve the ' + aichiTargetReadable(target) + ' before its deadline).';
                  }
                } //getProgressText(progress, target)
                //=======================================================================
                //
                //=======================================================================
                function aichiTargetReadable(target) {

                  return target.replace("-", " ").replace("-", " ").toLowerCase().replace(/\b./g, function(m) {
                    return m.toUpperCase();
                  });
                } //aichiTargetReadable

                // //=======================================================================
                // //
                // //=======================================================================
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


                } //getMapObject


                //=======================================================================
                //
                //=======================================================================
                function getProgressIcon(progress) {

                  switch (progress) {
                    case 1:
                      return '/app/images/ratings/36A174B8-085A-4363-AE11-E34163A9209C.png';
                    case 2:
                      return '/app/images/ratings/2D241E0A-1D17-4A0A-9D52-B570D34B23BF.png';
                    case 3:
                      return '/app/images/ratings/486C27A7-6BDF-460D-92F8-312D337EC6E2.png';
                    case 4:
                      return '/app/images/ratings/E49EF94E-0590-486C-903B-68C5E54EC089.png';
                    case 5:
                      return '/app/images/ratings/884D8D8C-F2AE-4AAC-82E3-5B73CE627D45.png';
                  }
                } //getProgressIcon(progress)
                //=======================================================================
                //
                //=======================================================================
                function buildProgressBaloon(country, progress, target) {

                  var area = getMapObject(country.code);
                  area.balloonText = "<div class='panel panel-default' ><div class='panel-heading' style='font-weight:bold; font-size:medium; white-space: nowrap;color:#009B48;'><i class='flag-icon flag-icon-" + country.code.toLowerCase() + " ng-if='country.isEUR'></i>&nbsp;";
                  var euImg = "<img src='/app/images/flags/Flag_of_Europe.svg' style='width:25px;hight:21px;' ng-if='country.isEUR'></img>&nbsp;";
                  var balloonText2 = area.title + "</div> <div class='panel-body' style='text-align:left;'><img style='float:right;width:60px;hight:60px;' src='" + getProgressIcon(progress) + "' >" + getProgressText(progress, target) + "</div> </div>";
                  if (country.isEUR)
                    area.balloonText += euImg;
                  area.balloonText += balloonText2;
                } //buildProgressBaloon

                //============================================================
                //
                //============================================================
                $scope.goTo = function (targetId) {
                    if(targetId); {
                        $location.path('/target/' + targetId);
                    }
                };
            }
        };
    }]);

});