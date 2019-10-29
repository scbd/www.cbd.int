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
                itemColor:'=',
                documents:'='
            },
            link: function($scope, $elem, $attrs, ctrls) {

                
                var initWatch = $scope.$watch('documents',function(newVal){
                   
                    if(!newVal || !newVal.length) return
                    initWatch();

                    ctrls[0].init();
    
                  },true);

            },
            controller: ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {
                $scope.showAllFlag=true;

                function init() { 

                    progressCounts($scope.documents,$scope.showAllFlag);
                    buildPie();
                }
                this.init = init;

                //============================================================
                //
                //============================================================
                function buildPie() {

                    var radius = 100;

                    if($window.screen.width<= 750){
                        radius = 75;
                        legend ={
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
                              "valueText":" ([[value]]/"+$scope.total()+")"
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
                    });
                    $timeout(function() {
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
                    },2000);

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

                    var query = 'NOT version_s:* AND realm_ss:chm AND schema_s:nationalAssessment AND (nationalTarget_s:"' + targetText + '" OR nationalTargetAichiTargets_ss:"' + targetText + '") AND _latest_s:true AND _state_s:public';
                    return query;
                }

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
                        color:'#6c1c67'
                    };
                    $scope.chartData[3] = {
                        title: 'No Change',
                        count: 0,
                        color: '#ee1d23'
                    };
                    $scope.chartData[2] = {
                        title: 'Insufficient Rate',
                        count: 0,
                        color: '#fec210'
                    };
                    $scope.chartData[1] = {
                        title: 'Meeting Target',
                        count: 0,
                        color: '#109e49'
                    };
                    $scope.chartData[0] = {
                        title: 'Exceeding Target',
                        count: 0,
                        color: '#1074bc'
                    };
                    if(showAll)
                        $scope.chartData[5] = {
                            title: 'No Data',
                            count: 0,
                            color: '#bbbbbb'
                        };
                    _.each(docs, function(doc) {
                        var noData = (!doc.docs || !doc.docs.length) || !Number.isInteger(doc.progressNumber)
                        if (!showAll && !Number.isInteger(doc.progressNumber) )
                            return 
                            
                        if(noData)
                            $scope.chartData[5].count++
                        else
                            $scope.chartData[Math.abs(doc.progressNumber-5)].count++;
                        total++;

                    });

                } 

            }]
        };
    }]);

});