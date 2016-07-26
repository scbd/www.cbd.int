define(['app', 'lodash',
    'amchart',
    'shim!amchart/pie[amchart]',
    'shim!amchart/themes/light[amchart]'
], function(app, _) {
    'use strict';

    //============================================================
    //
    //============================================================
    app.directive('progressPie', function() {
        return {
            restrict: 'E',
            template: '<div id="chartdivpie" style="width:100%;height:350px; font-size	: 8px;"></div><div class="text-center" style="cursor:pointer;" ng-click="showAll()" ng-if="!nothingReported"><span ng-if="!showAllFlag"><a hraf="#" >Show Reported and Unreported</a></span><span ng-if="showAllFlag"><a hraf="#" >Show Reported Only</a></span></div>',
            require: '^progressPie',
            scope: {
                aichiTarget: '=aichiTarget',
            },
            link: function($scope, $elem, $attrs, progressPieCtrl) {

                progressPieCtrl.init();
            },
            controller: ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {
                $scope.showAllFlag=false;
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

                    //if ($scope.nothingReported) return;
                    if (!$scope.chartData) throw "error no chart data loaded";
                    $timeout(function() {
                        $scope.chartPie = AmCharts.makeChart("chartdivpie", { //jshint ignore:line
                            "showZeroSlices": true,
                            "type": "pie",
                            "theme": "light",
                            "dataProvider": $scope.chartData,
                            "valueField": "count",
                            "titleField": "title",
                            "outlineAlpha": 0.4,
                            "depth3D": 15,
                            "colorField": "color",
                            "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[count]]</b> ([[percents]]%)</span>",
                            "angle": 20,
                            "autoResize": true,
                            "fontSize": 10,
                            "labelRadius": 10,
                        });
                        _.each($scope.chartPie.dataProvider, function(slice, index) {
                            slice.color = $scope.chartData[index].color;
                        });
                        $scope.chartPie.validateNow();
                        $scope.chartPie.animateAgain();

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

                    return $http.get('/api/v2013/index/select', {
                        params: queryParameters,
                        cache: true
                    }).success(function(data) {

                        $scope.count = data.response.numFound;
                        $scope.documents = data.response.docs;
                        progressCounts($scope.documents);
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
                    $scope.chartData[0] = {
                        title: 'Moving Away',
                        count: 0,
                        color: progressToColor(0)
                    };
                    $scope.chartData[1] = {
                        title: 'No Change',
                        count: 0,
                        color: progressToColor(1)
                    };
                    $scope.chartData[2] = {
                        title: 'Insufficient Rate',
                        count: 0,
                        color: progressToColor(2)
                    };
                    $scope.chartData[3] = {
                        title: 'Meeting Target',
                        count: 0,
                        color: progressToColor(3)
                    };
                    $scope.chartData[4] = {
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
                        title: 'No Information',
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
    });

});