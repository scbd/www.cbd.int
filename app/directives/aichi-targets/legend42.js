define(['app', 'text!./legend42.html', 'lodash', 'directives/aichi-targets/progress-pie','directives/aichi-targets/national-targets-map','providers/locale'], function(app, templateHtml, _) {
    'use strict';

    //============================================================
    //
    //============================================================
    app.directive('legend42', [ 'locale', '$http', '$q', '$routeParams', function(locale, $http, $q, $routeParams) {
        return {
            restrict: 'E',

            template: templateHtml,
            link: function($scope, $elem,$attrs, selfCtrl) {
                $scope.itemColor    = { color: false };
                $scope.clearSearch  = function(){ $scope.searchNatTar = ''; };
                $scope.searchNatTar = '';
                $scope.showMap      = true;
                $scope.aichiTarget  = parseInt($routeParams.targetId);

                selfCtrl.init();
    
            },
            controller: function($scope) {
              var countries

              function init() {
                $scope.showMap = true;
                $scope.selectedCountry={};

                $q.all([ loadCountries(), query(), queryTargets() ])
                  .then( groupByCountry );
              }
              this.init = init;

              function loadCountries() {

                return $http.get('/api/v2015/countries', {
                    cache: true,
                }).then(function(res) {
                    _.each(res.data, function(c) {
                        c.name = c.name[locale];
                    });
                    countries = res.data;
                });
              }

              function queryText() {
                    var targetText = '';
                    if ($scope.aichiTarget < 10)
                        targetText = 'AICHI-TARGET-0' + $scope.aichiTarget;
                    else
                        targetText = 'AICHI-TARGET-' + $scope.aichiTarget;

                    var query = 'NOT version_s:* AND realm_ss:chm AND schema_s:nationalAssessment AND (nationalTarget_s:"' + targetText + '" OR nationalTargetAichiTargets_ss:"' + targetText + '") AND _latest_s:true AND _state_s:public';
                    return query;
              }

              function query() {

                    var queryParameters = {
                        'q': queryText(),
                        'sort': 'createdDate_dt desc, title_t asc',
                        'fl': 'reportType_s,documentID,identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t,_latest_s,nationalTarget_EN_t,progress_EN_t,year_i,text_EN_txt,nationalTarget_EN_t,government_s,nationalTargetAichiTargets_ss,nationalTarget_s',
                        'wt': 'json',
                        'start': 0,
                        'rows': 1000000,
                    };

                    return $http.get('/api/v2013/index/select', {
                        params: queryParameters,
                        cache:true
                    }).success(function(data) {
                        $scope.count = data.response.numFound;
                        $scope.documents = data.response.docs;

                        _.forEach($scope.documents,function(d){
                          d.progressNumber = progressToNumber(d.progress_EN_t)
                          d.progressColor = progressToColor(d.progressNumber)
                        })
                    });
              }

              function queryTargets() {
                  var targetText = '';
                  if ($scope.aichiTarget < 10)
                      targetText = 'AICHI-TARGET-0' + $scope.aichiTarget;
                  else
                      targetText = 'AICHI-TARGET-' + $scope.aichiTarget;

                  var queryParameters = {
                      'q': 'schema_s:nationalTarget AND (nationalTarget_s:"' + targetText + '" OR nationalTargetAichiTargets_ss:"' + targetText + '")',// OR otherAichiTargets_ss:'+ targetText+ '")',
                      'sort': 'createdDate_dt desc, title_t asc',
                      'fl':'isAichiTarget_b,government_s,isAichiTarget_b,title_s,description_s',
                      'wt': 'json',
                      'start': 0,
                      'rows': 1000000,
                  };

                  return $http.get('/api/v2013/index/select', {
                      params: queryParameters,
                      cache:true
                  }).success(function(data) {
                      $scope.tcount = data.response.numFound;
                      $scope.tdocuments = data.response.docs;

                      _.forEach($scope.tdocuments,function(d){
                        d.progressNumber = progressToNumber(d.progress_EN_t)
                        d.progressColor = progressToColor(d.progressNumber)
                      })
                  })
              } 

              function groupByCountry() {
                var country=null;
                _.each($scope.documents, function(doc) {
                    country=null;
                    country = _.find(countries,{code:doc.government_s.toUpperCase()});
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
                        return b.progressNum - a.progressNum;
                    }); // sort sort by progress
                    country.progressColor = country.docs[0].progressColor
                    country.progressNumber = country.docs[0].progressNumber
                });

                _.each($scope.tdocuments,function(doc){
                    country = null;
                    country = _.find(countries,{code:doc.government_s.toUpperCase()});
                    if(!country.targets)
                      country.targets = []; // initializes the countries docs
                    country.targets.push(doc);
                });

                $scope.countries = countries
              }

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
              } 

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
              }

            }
        };
    }]);

});