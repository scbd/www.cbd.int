import 'ammap'
import 'ammap/themes/light'
import '~/directives/reporting-display/worldEUHigh'
import '~/providers/locale'
import '~/directives/common/export-directive'
import 'css!cdn!npm/flag-icon-css@2.3.0/css/flag-icon.min.css';
import app from '~/app'
import _ from 'lodash'
import template from './national-targets-map.html'
import targetTemplate from './target.html'
import row from './target-row.html' 

    //============================================================
    //
    //============================================================
    app.directive('nationalTargetsMap',['$http','$q','locale','$interpolate','$timeout', '$filter',  function($http,$q,locale,$interpolate,$timeout, $filter) {
        return {
            restrict: 'E',
            require:'nationalTargetsMap',
            template : template,
            scope: {
                aichiTarget: '=aichiTarget',
                legendHide:'&',
                itemColor: '=',
                searchTarget:'=',
                showMap:'='
            },
            link: function ($scope, $elem, $attrs,selfCtrl) {
              $scope.$watch('itemColor',function(){
                if($scope.itemColor && $scope.itemColor.color){

                  $scope.legendHide($scope.itemColor);
                }
              },true);

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

                $scope.getExportData = getExportData;
                //============================================================
                //
                //============================================================
                function init() {
                    $scope.showMap = true;
                    $scope.selectedCountry={};

                    $q.all([loadCountries(), query(),queryTargets()])
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
                      "rollOverColor": "#423f3f",
                      "selectable": true,
                      "color": "#aaaaaa",
                    },
                    "zoomControl": {
                		"zoomControlEnabled": true,
                    "right": 10
                	  }

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
                    case "Unknown":
                        return 0;
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

                    var query = 'NOT version_s:* AND realm_ss:chm AND schema_s:nationalAssessment AND (nationalTarget_s:"' + targetText + '" OR nationalTargetMainAichiTargets_ss:"' + targetText + '") AND _latest_s:true AND _state_s:public';
                    return query;
                }


                //=======================================================================
                //
                //=======================================================================
                function query() {

                    var queryParameters = {
                        'q': queryText(),
                        'sort': 'createdDate_dt desc, title_t asc',
                        'fl': 'reportType_s,documentID,identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t,_latest_s,nationalTarget_EN_t,progress_EN_t,year_i,text_EN_txt,nationalTarget_EN_t,government_s,nationalTargetMainAichiTargets_ss,nationalTarget_s',
                        'wt': 'json',
                        'start': 0,
                        'rows': 1000000,
                    };

                    return $http.get('/api/v2013/index/select', {
                        params: queryParameters,
                        cache:true
                    }).then(function({data}) {
                        $scope.count = data.response.numFound;
                        $scope.documents = data.response.docs;
                    });
                } // query

                //=======================================================================
                //
                //=======================================================================
                function queryTargets() {
                    var targetText = '';
                    if ($scope.aichiTarget < 10)
                        targetText = 'AICHI-TARGET-0' + $scope.aichiTarget;
                    else
                        targetText = 'AICHI-TARGET-' + $scope.aichiTarget;

                    var queryParameters = {
                        'q'    : 'realm_ss:chm AND schema_s:nationalTarget AND (aichiTargets_ss:"' + targetText+ '")',   // OR otherAichiTargets_ss:'+ targetText+ '")',
                        'sort': 'createdDate_dt desc, title_t asc',
                        'fl':'isAichiTarget_b,government_s,isAichiTarget_b,title_s,description_s',
                        'wt': 'json',
                        'start': 0,
                        'rows': 1000000,
                    };

                    return $http.get('/api/v2013/index/select', {
                        params: queryParameters,
                        cache:true
                    }).then(function({data}) {
                        $scope.tcount = data.response.numFound;
                        $scope.tdocuments = data.response.docs;
                    });
                } // query
                //=======================================================================
                //
                //=======================================================================
                function loadCountries() {

                    return $http.get('https://api.cbddev.xyz/api/v2015/countries', {
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


                  if(!_.isEmpty(country.docs)){
                      changeAreaColor(country.code, progressToColor(averageAssessmentProgress(country.docs)));
                  }
                  if(!_.isEmpty(country.targets)){
                      buildTargetBaloon(country);
                  }
                  // buildProgressBaloon(country, averageAssessmentProgress(country.docs), country.docs[0].nationalTarget_EN_t);
                  // legendTitle(country);
                  // restLegend($scope.leggends.aichiTarget);
                } // aichiMap

                function averageAssessmentProgress(docs){
                  if(docs.length == 1)
                    return progressToNumber(docs[0].progress_EN_t);
        
                  var progressCount = { 0:0,1:0,2:0,3:0,4:0,5:0 }
                  _.each(docs, function(d){
                    var num = progressToNumber(d.progress_EN_t);
                    progressCount[num]++;
                  });
                  var count = _.reduce(progressCount, function(count, n, k){
                                return count += (n * (parseInt(k)));
                              }, 0);
        
                  var validDocs = _.filter(docs, function(doc){
                    return !_.includes(["Unknown"], doc.progress_EN_t)
                  });
                  return Math.round(count/validDocs.length);
        
                }

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

                  _.each($scope.tdocuments,function(doc){
                      country=null;
                      country = _.find($scope.countries,{code:doc.government_s.toUpperCase()});
                      if(!country.targets)
                        country.targets = []; // initializes the countries docs
                      country.targets.push(doc);
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
                    case "Unknown":
                        return 0;
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
                  $scope.map.addListener("clickMapObject", function(event) {

                     $scope.selectedCountry=_.find($scope.countries,{'code':event.mapObject.id});

                     $timeout(function(){$scope.showMap= false;});

                  });
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
                    case 0:
                        return '#eee';
                  }
                } //readQueryString

                //=======================================================================
                //
                //=======================================================================
                function getProgressText(progress, target) {

                  switch (progress) {
                    case 0:
                      return 'Unknown ' + aichiTargetReadable(target);
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

                } // buildTargetBaloon

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

                function getExportData(){

                  var headers = {
                    "government_EN_t"    : { title : 'Government' },
                    "title_t"            : { title : 'Title' },
                    "nationalTarget_EN_t": { title : 'National Target' },
                    "aichiTarget"        : { title : 'Aichi Target' },
                    "assessmentFor"      : { title : 'Assessment For' },
                    "progress_EN_t"      : { title : 'Progress' },
                    "date_dt"            : { title : 'Submission Date' },
                    "url_ss"             : { title : 'Url', type:'url' },
                    "schema_EN_t"        : { title : 'Schema' },
                  }

                  // "nationalTargetAichiTargets_ss" : { title : 'Other Aichi targets related to national target' },
                  var data = _($scope.documents)
                  .sortBy('government_EN_t')
                  .map(function(document){
                    var row = {};
                    _.each(headers, function(header, key){
                      if(key == 'url_ss')
                        row[header.title] = document[key][0];
                      else if(key == 'date_dt')
                        row[header.title] = $filter('moment')(document[key], 'format', 'DD MMMM YYYY');
                      else if(key == 'aichiTarget')
                        row[header.title] = 'Aichi Target ' + $scope.aichiTarget;
                      else if(key == 'assessmentFor')
                        row[header.title] = document['nationalTargetMainAichiTargets_ss'] ? 'National Target' : 'Global Target';
                      else if(_.isArray(document[key]))
                        row[header.title] = document[key].join(', ');
                      else
                        row[header.title] = document[key];

                    })
                    return row;
                  }).value()
                  return {
                    headers: _.values(headers),
                    data   : data
                  }

                }
            }
        };
    }]);