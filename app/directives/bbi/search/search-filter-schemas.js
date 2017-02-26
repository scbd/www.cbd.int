define(['text!./search-filter-schemas.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

    app.directive('searchFilterSchemas',[ "$timeout", function ($timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^search',
        scope: {
              title: '@title',
              items: '=ngModel',
              facet: '@facet'
        },
    link : function ($scope, $element, $attr, searchCtrl)
        {
            $scope.total=0;
            $scope.terms = [];
            $scope.filters=searchCtrl.filters;
            $scope.outreachRecords = [
                { name:'schema_s', identifier: 'notification', title: 'Notifications'  , count: 0 },
                { name:'schema_s',identifier: 'pressRelease', title: 'Press Releases' , count: 0 },
                { name:'schema_s',identifier: 'statement'   , title: 'Statements'     , count: 0 },
                { name:'schema_s',identifier: 'announcement', title: 'Announcements'  , count: 0 },
                { name:'schema_s',identifier: 'meetings'       , title: 'Events'         , count: 0 },
                { name:'schema_s',identifier: 'sideEvent'       , title: 'Side-events'         , count: 0 },
            ];

            $scope.referenceRecords = [
                { name:'schema_s',identifier: 'bbiProfile'                 , title: 'Providers'                   , count: 0 },
                { name:'schema_s',identifier: 'bbiOpportunity'             , title: 'Opportunities'               , count: 0 },
                { name:'schema_s',identifier: 'bbiRequest'                 , title: 'Assistance Requests'       , count: 0 },
                { name:'schema_s',identifier: 'bbiProposal'                , title: 'Proposals'       , count: 0 },
                { name:'schema_s',identifier: 'bbiContact'                 , title: 'Contacts'                   , count: 0 },
                { name:'schema_s',identifier: 'organization'               , title: 'Organizations'                 , count: 0 },
                { name:'schema_s',identifier: 'resource'                   , title: 'VL Resources'     , count: 0 },
                { name:'schema_s',identifier: 'capacityBuildingInitiative' , title: 'CB Initiatives' , count: 0 },
            ];


            // $scope.meetingRecords = [
            //     { identifier: 'meeting'                 , title: 'Meetings'                      , count: 0 },
            //     { identifier: 'meetingDocument'         , title: 'Documents'                     , count: 0 },
            //     { identifier: 'decision'                , title: 'Decisions'                     , count: 0 },
            //     { identifier: 'recommendation'          , title: 'Recommendations'               , count: 0    }
            // ];


            buildTermsAndQuery();

            var filterWatchKill = addFilterWatch();

            $scope.$watch('items',function(){
              searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet);
              calcTotal();
            }); // ensure binding gets done at end in order to display facits

            //=======================================================================
      			//
      			//=======================================================================
            $scope.refresh = function (item,forceDelete){

                  searchCtrl.refresh(item,forceDelete,$scope.terms,$scope.items,$scope.facet);
            };//$scope.refresh

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

                  _.each($scope.referenceRecords.concat($scope.outreachRecords),function(rec){
                        if(_.find($scope.filters,{'identifier':rec.identifier}))
                          rec.selected=true;
                        else
                          rec.selected=false;
                  });
            }//

            //=======================================================================
      			//
      			//=======================================================================
            $scope.totalRecords= function (type){

              var total=0;
              _.each($scope[type],function (filterElement){
                      if (filterElement.count)  total+=filterElement.count;
              });
              if(total)
                return total;
              else
                return 0;
            };//$scope.refresh
            //=======================================================================
      			//
      			//=======================================================================
            function buildTermsAndQuery() {

                  $scope.terms = _.union($scope.outreachRecords, $scope.referenceRecords, $scope.copRecords, $scope.meetingRecords, $scope.nationalRecords,$scope.cbdManagedRecords );
                  $scope.terms = searchCtrl.updateTerms($scope.terms,$scope.items,$scope.facet);
                  searchCtrl.buildChildQuery($scope.terms,$scope.items,$scope.facet);
            }//buildTermsAndQuery()

            //=======================================================================
      			//
      			//=======================================================================
            function calcTotal() {
                  $scope.total=0;
                  _.each($scope.terms,function(val){
                        $scope.total+=val.count;
                  });
            }//calcTotal

          }//link
      }; // return
    }]);  //app.directive('searchFilterCountries
  });// define;
