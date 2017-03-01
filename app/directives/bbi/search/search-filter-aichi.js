define(['text!./search-filter-aichi.html', 'app', 'lodash','angular','directives/bbi/toggle'], function(template, app, _,angular) { 'use strict';

app.directive('searchFilterAichi',['$http','Thesaurus','$timeout', function ($http,thesaurus,$timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^search',
        scope: {
              title: '@title',
              items: '=ngModel',
              facet: '@facet',
              count: '=count' // total count of all children subquires needed for 0 result combinations
        },
          link : function ($scope, $element, $attr, searchCtrl)
        {
            $scope.expanded = false;

            var termsMap =[];
            $scope.termsArray=[];
            $scope.terms = [];
            $scope.termsModal = {};
            $timeout(function(){
                          $element.find('[data-toggle="tooltip"]').tooltip();
                      },1000);


            $scope.filters=searchCtrl.filters;
            var filterWatchKill = addFilterWatch();
            //=======================================================================
      			//
      			//=======================================================================
             function addFilterWatch(){
                  return $scope.$watch('filters.length',function(){
                                  unselectAll();
                                  addCount();
                              });
            }//
            //=======================================================================
      			//
      			//=======================================================================
             function addCount(){
                  var wasFiltersUpdated = false;
                  _.each($scope.filters,function(filter,index){
                    if(filter.name!==$scope.facet)return;
                    if(filter.name===filter.title || typeof filter.count ==='undefined'){
                      var termFound = _.find($scope.termsArray,{identifier:filter.identifier});
                      if(termFound){
                        filterWatchKill();
                      	$scope.filters[index] = termFound;
                        wasFiltersUpdated =true;
                      }
                    }
                  });

                  if(wasFiltersUpdated)
                    $timeout(function(){filterWatchKill = addFilterWatch();},100);
            }//
            //=======================================================================
      			//
      			//=======================================================================
             function unselectAll(){

                  _.each($scope.termsArray,function(rec){
                        if(_.find($scope.filters,{'identifier':rec.identifier}))
                          rec.selected=true;
                        else
                          rec.selected=false;
                  });
            }//
            buildTermsAndQuery();
            $scope.$watch('items',function(){
              if($scope.items && $scope.items.length){
                searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
                _.each($scope.terms,function(term){

                  _.each(term.narrowerTerms,function(t){
                        if(t.count) term.count+=t.count;
                  });
                });
              }
            });

            //=======================================================================
            //
            //=======================================================================
            function buildTermsAndQuery() {

                    if(_.isEmpty(termsMap)){ // get terms once and save
                        $http.get('/api/v2013/thesaurus/domains/0BB90152-BE5D-4A51-B090-D29906F65247/terms').success(function (data) {

                              $scope.terms = thesaurus.buildTree(data);
                              termsMap   = flatten($scope.terms, {});
                              $scope.termsArray = _.values(termsMap);
                              _.each($scope.termsArray,function(term){
                                  term.name=$scope.facet;
                              });
                              termsMap=searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
                              searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);
                          });
                    }else{
                            termsMap = searchCtrl.updateTerms(termsMap,$scope.items,$scope.facet);
                            searchCtrl.buildChildQuery(termsMap,$scope.items,$scope.facet);

                    }
            }//buildTermsAndQuery()

            //=======================================================================
            //
            //=======================================================================
            $scope.refresh = function (item,forceDelete){

                    searchCtrl.refresh(item,forceDelete,termsMap,$scope.items,$scope.facet);
            };//$scope.refresh


            //=======================================================================
            //
            //=======================================================================
            function flatten(items, collection) {
                    items.forEach(function (item) {
                        item.selected = false;
                        item.indeterminateCounterA = 0;
                        item.indeterminateCounterB = 0;
                        collection[item.identifier] = item;
                        if(item.narrowerTerms)
                            flatten(item.narrowerTerms, collection);
                    });
                    return collection;
            }// flatten

        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
