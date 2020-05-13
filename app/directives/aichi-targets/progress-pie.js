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
                        id: -1,
                        title: 'Not Reported',
                        visible: true,
                        color: '#dddddd'
                    },{
                            id: 0,
                            title: 'Unknow',
                            visible: true,
                            color: '#eee'
                    },{
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
                        title: 'Meeting Target',
                        visible: true,
                        color: '#109e49'
                    }, {
                        id: 5,
                        title: 'Exceeding Target',
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
                        radius = 75;
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
                            "labelText" : '',
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
                function total() {
                    var total =0;
                    _.each($scope.chartData,function(r){
                      total+=r.count;
                    });
                    _.each($scope.chartData,function(r){
                      r.percent=Math.floor((r.count/total)*100);
                    });

                    return total;
                }
                $scope.total=total;
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
                        progressCounts($scope.documents,$scope.showAllFlag)
                        .then(function(){
                            buildPie()
                        });
                    });
                } // query


                //=======================================================================
                //
                //=======================================================================
                function showAll() {
                  $scope.showAllFlag=!$scope.showAllFlag;
                  progressCounts($scope.documents,$scope.showAllFlag).then(function(){
                      buildPie()
                    });
                }
                $scope.showAll=showAll;


                //=======================================================================
                //
                //=======================================================================
                function progressCounts(docs,showAll) {

                    return $http.get('/api/v2013/countries', {cache:true}).then(function(data) {

                        $scope.chartData = [];
                        $scope.nothingReported = true;
                        var total =0;
                        $scope.chartData[5] = {
                            title: 'Exceeding Target',
                            count: 0,
                            color: progressToColor('Exceeding Target')
                        };
                        $scope.chartData[4] = {
                            title: 'Meeting Target',
                            count: 0,
                            color: progressToColor('Meeting Target')
                        };
                        $scope.chartData[3] = {
                            title: 'Insufficient Rate',
                            count: 0,
                            color: progressToColor('Insufficient Rate')
                        };
                        $scope.chartData[2] = {
                            title: 'No Progress',
                            count: 0,
                            color: progressToColor('No Progress')
                        };
                        $scope.chartData[1] = {
                            title: 'Moving Away',
                            count: 0,
                            color: progressToColor('Moving Away')
                        };
                        $scope.chartData[0] = {
                            title: 'Unknow',
                            count: 0,
                            color: progressToColor('Unknow')
                        };
                        var countryC = 0
                        _.each(data.data, function(country){
                        
                            var assessments = _.filter(docs, {government_s:country.code.toLowerCase()});
                            if(assessments.length>0){
                                // console.log(assessments);
                                countryC++
                                $scope.chartData[averageAssessmentProgress(assessments)].count++;
                                total++;
                                $scope.nothingReported = false;
                            }
                        })
                        console.log(countryC)
                        // _.each(docs, function(doc) {
                        //     if (progressToNum(doc.progress_EN_t) === undefined){
                        //         return 
                        //     }

                        //     $scope.chartData[progressToNum(doc.progress_EN_t)].count++;
                        //     total++;
                        // });

                        if($scope.nothingReported)
                            showAll = true;

                        if(showAll){
                            $scope.chartData[6] = {
                                title: 'Not Reported',
                                count: 196-total,
                                color: '#bbbbbb'
                            };
                        }
                    });
                } //

                function averageAssessmentProgress(docs){
                    if(docs.length == 1)
                      return progressToNum(docs[0].progress_EN_t);
          
                    var progressCount = { 0:0,1:0,2:0,3:0,4:0,5:0 }
                    _.each(docs, function(d){
                      var num = progressToNum(d.progress_EN_t);
                      progressCount[num]++;
                    });
                    var count = _.reduce(progressCount, function(count, n, k){
                                  return count += (n * parseInt(k));
                                }, 0);
          
                    return Math.round(count/docs.length);
          
                  }

                //=======================================================================
                //
                //=======================================================================
                function progressToColor(progress) {
                    var aichi = _.find($scope.leggends.aichiTarget, {title:progress})
                    if(aichi)
                        return aichi.color

                    return $scope.leggends.aichiTarget[0].color;
                }


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


            }]
        };
    }]);

});