define(['app', 'lodash','text!./progress-pie.html',
    'amchart',
    'shim!amchart/pie[amchart]',
    'shim!amchart/themes/light[amchart]'
], function(app, _,template) {
    'use strict';

    //============================================================
    //
    //============================================================
    app.directive('progressPie', ['$window',function($window) {
        return {
            restrict: 'E',
            template: template,
            require: ['^progressPie','^legend42'],
            scope: {
                aichiTarget: '=aichiTarget',
                itemColor:'='
            },
            link: function($scope, $elem, $attrs, ctrls) {

                ctrls[0].init();

            },
            controller: ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {
                $scope.showAllFlag=true;
                $scope.leggends = {
                    aichiTarget: [{
                        id: 0,
                        title: 'No Data',
                        visible: true,
                        color: '#dddddd'
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
                    }, ]
                };


                //============================================================
                //
                //============================================================
                function init() { //jshint ignore:line
                    query().then(buildPie);
                }
                this.init = init;


                //============================================================
                //
                //============================================================
                function buildPie() {

                    var radius = 100;
                    var legend ={
                      "position":"right",
                      "marginRight":20,
                      "autoMargins":false,
                      "fontSize":12
                    };

                    if($window.screen.width<= 750){
                        radius = 65;
                        legend ={
                          // "position":"bottom",
                          "marginRight":20,
                          "autoMargins":false,
                          "fontSize":14
                        };
                    }

                    if (!$scope.chartData) throw "error no chart data loaded";
                    $timeout(function() {
                        $scope.chartPie = AmCharts.makeChart("chartdivpie", { //jshint ignore:line
                            "showZeroSlices": false,
                            "type": "pie",
                            "legend": {
                              "divId": "legend-div",
                              "spacing":10,
                              "valueText":" ([[value]]/196)"
                            },
                            "pieX":'50%',
                            "innerRadius": "30%",
                            "theme": "light",
                            "dataProvider": $scope.chartData,
                            "valueField": "count",
                            "titleField": "title",
                            "outlineAlpha": 0.4,
                            "colorField": "color",
                            "fontSize": 10,
                            "labelRadius": -30,
                            "labelText" : '[[percents]]%',
                            "radius":radius,
                            'startDuration':0.01

                        });

                        _.each($scope.chartPie.dataProvider, function(slice, index) {
                            slice.color = $scope.chartData[index].color;
                        });

                        $scope.chartPie.legend.addListener('hideItem', function(e){
                             $timeout(function(){  $scope.itemColor.color=false;});
                             $timeout(function(){
                               if(e.dataItem.color==='#bbbbbb')
                                  $scope.itemColor.color='#aaaaaa';
                               else{
                                 $scope.itemColor.color=e.dataItem.color;
                               }
                             });
                        });
                        $scope.chartPie.legend.addListener('showItem', function(e){
                            $timeout(function(){ $scope.itemColor.color=false; });
                            $timeout(function(){
                              if(e.dataItem.color==='#bbbbbb')
                                 $scope.itemColor.color='#aaaaaa';
                              else{
                                $scope.itemColor.color=e.dataItem.color;
                              }
                            });
                        });
                    });
                }

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
                        'fl': 'identifier_s,progress_EN_t,nationalTarget_EN_t,government_s',
                        'wt': 'json',
                        'start': 0,
                        'rows': 1000000,
                    };

                    return $http.get('https://api.cbd.int/api/v2013/index/select', {
                        params: queryParameters,

                    }).success(function(data) {

                        $scope.count = data.response.numFound;
                        $scope.documents = data.response.docs;
                        progressCounts($scope.documents,$scope.showAllFlag);
                    });
                } // query


                //=======================================================================
                //
                //=======================================================================
                function showAll() {
                  $scope.showAllFlag=!$scope.showAllFlag;
                  progressCounts($scope.documents,$scope.showAllFlag);
                  buildPie();
                }
                $scope.showAll=showAll;


                //=======================================================================
                //
                //=======================================================================
                function progressCounts(docs,showAll) {
                    $scope.chartData = [];
                    $scope.nothingReported = true;
                    var total =0;
                    $scope.chartData[4] = {
                        title: 'Moving Away',
                        count: 0,
                        color: progressToColor(0)
                    };
                    $scope.chartData[3] = {
                        title: 'No Change',
                        count: 0,
                        color: progressToColor(1)
                    };
                    $scope.chartData[2] = {
                        title: 'Insufficient Rate',
                        count: 0,
                        color: progressToColor(2)
                    };
                    $scope.chartData[1] = {
                        title: 'Meeting Target',
                        count: 0,
                        color: progressToColor(3)
                    };
                    $scope.chartData[0] = {
                        title: 'Exceeding Target',
                        count: 0,
                        color: progressToColor(4)
                    };
                    _.each(docs, function(doc) {
                        if (!doc.progress_EN_t) throw "Error no progress reported";
                        $scope.chartData[progressToNum(doc.progress_EN_t)].count++;
                        total++;
                        $scope.nothingReported = false;
                    });
                    if($scope.nothingReported)
                      showAll = true;
                    if(showAll)
                    $scope.chartData[5] = {
                        title: 'No Data',
                        count: 196-total,
                        color: '#bbbbbb'
                    };
                } //



                //=======================================================================
                //
                //=======================================================================
                function progressToColor(progress) {

                    switch (progress) {
                        case 4:
                            return '#1074bc';
                        case 3:
                            return '#109e49';
                        case 2:
                            return '#fec210';
                        case 1:
                            return '#ee1d23';
                        case 0:
                            return '#6c1c67';
                    }
                }


                //=======================================================================
                //
                //=======================================================================
                function progressToNum(progress) {

                    switch (progress.trim()) {
                        case "On track to exceed target":
                            return 4;
                        case "On track to achieve target":
                            return 3;
                        case "Progress towards target but at an  insufficient rate":
                            return 2;
                        case "No significant change":
                            return 1;
                        case "Moving away from target":
                            return 0;
                    }
                } //


            }]
        };
    }]);

});