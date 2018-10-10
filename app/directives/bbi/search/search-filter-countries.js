define(['text!./search-filter-countries.html','app','lodash','filters/byLetter'], function(template, app,_) { 'use strict';

    app.directive('searchFilterCountries', ["$http",'$timeout', function ($http,  $timeout) {
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

            $scope.alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
                               'N','O','P','Q','R','S','T','U','V','W','X','Y','Z','ALL'];

            $scope.expanded = false;
            $scope.terms = [];
            $scope.termsModal = {};
            $scope.selectedIndex=$scope.alphabet.length-1;
            $scope.sLetter='';
            var rawCountries = null;

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
                      var termFound = _.find($scope.terms,{identifier:filter.identifier});
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

                  _.each($scope.terms,function(rec){
                        if(_.find($scope.filters,{'identifier':rec.identifier}))
                          rec.selected=true;
                        else
                          rec.selected=false;
                  });
            }//

            buildTermsAndQuery();
            $scope.$watch('items',function(){
              if($scope.items && $scope.items.length)
              searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,rawCountries);

            });

            //=======================================================================
      			//
      			//=======================================================================
            function buildTermsAndQuery() {

                    if(!rawCountries){
                        $http.get('/api/v2013/thesaurus/domains/countries/terms').then(function (data) {

                            rawCountries = data.data;
                            _.each(rawCountries,function(country){
                                country.name=$scope.facet;
                            });
                            $scope.terms = searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,data.data);
                            searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet,data.data);
                        });
                    }else{
                        $scope.terms=searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet,rawCountries); // save terms to avoid multiple server quiries for same data
                        searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet,rawCountries);
                    }
            }//buildTermsAndQuery()

            //=======================================================================
      			//
      			//=======================================================================
            $scope.refresh = function (item,forceDelete){

                    searchCtrl.refresh(item,forceDelete,$scope.terms,$scope.items,$scope.facet,rawCountries);
            };//$scope.refresh


            // =======================================================================
            //
        		// =======================================================================
            $scope.selectedLetter= function(index) {

                    $scope.sLetter = $scope.alphabet[index];
                    $scope.selectedIndex = index;
            };//$scope.selectedLetter

        }//link
    }; // return
  }]);  //app.directive('searchFilterCountries
});// define
