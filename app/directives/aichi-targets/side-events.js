define(['app','lodash', 'text!./side-events.html','data/aichi-targets/targets','directives/aichi-targets/sorter-mongo','directives/aichi-targets/pagination','providers/locale','services/mongo-storage','filters/moment'], function(app,_, templateHtml,targetsData) {
    'use strict';

    //============================================================
    //
    //============================================================
    app.directive('sideEvents', ['$http','locale','mongoStorage', function($http,locale,mongoStorage) {
        return {
            restrict: 'E',
            scope: {
                searchText:'=',
                country:'=?',

            },
            require:'sideEvents',
            template: templateHtml,
            link: function($scope, $elem,$attrs, ctrl) {

                $scope.currentPage=0;
                $scope.itemsPerPage=3;
                $scope.pages=[];
                $scope.count=0;
                $scope.schema=$attrs.schema;
                $scope.target=$attrs.target;
                $scope.onPage=ctrl.search;

                if(!$scope.country) $scope.country='*';


                $scope.sort={'sideEvent.id':-1};

                $scope.loadCountries().then(function(){
                  $scope.$watch('searchText',function(){
                      ctrl.search(0);
                  });

                  $scope.$watch('sort',function(){
                      if($scope.sort)
                        ctrl.search(0);
                  });

                  $scope.$watch('country',function(){
                      if($scope.country)
                        ctrl.search(0);
                  });
                  loadConferences();
                });


                //=======================================================================
                //
                //=======================================================================
                $scope.searchBox = function(open){
                  if(!open)
                      $elem.find('div.item-overlay.bottom').css('bottom',0);
                  else
                      $elem.find('div.item-overlay.bottom').css('bottom','100%');

                };
                //=======================================================================
                //
                //=======================================================================
                $scope.conferenceName= function(res){
                  var c =_.find($scope.confrences,{'_id':res.location.conference});
                  if(!c)return '';
                  else return c.Title.en;
                };
                //============================================================
                //
                //============================================================
                function loadConferences(){
                    return mongoStorage.loadConferences().then(function(res){
                        $scope.confrences=res;
              console.log($scope.confrences);
                    });
                }
            },

            controller: function($scope) {

              //=======================================================================
              //
              //=======================================================================
              $scope.getNumberPages = function() {

                  if($scope.count && $scope.itemsPerPage && ($scope.count > $scope.itemsPerPage))
                      return new Array(Math.floor($scope.count/$scope.itemsPerPage)+1);
                  else
                      return new Array(1);

              };

              //=======================================================================
              //
              //=======================================================================
              function loadCountries() {

                  return $http.get('https://api.cbd.int/api/v2015/countries', {
                      cache: true,
                  }).then(function(res) {
                      _.each(res.data, function(c) {
                          c.name = c.name[locale];
                      });
                      $scope.countries = res.data;
                  });
              }
              $scope.loadCountries = loadCountries;


              //=======================================================================
              //
              //=======================================================================
              $scope.changePage = function(index) {
                  $scope.prevDate=false;
                  $scope.currentPage=index;
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.goTo = function(url) {
                window.location.replace(url);
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.isActive = function(index) {
                  return ($scope.currentPage===(index));
              };

              //======================================================
              //
              //
              //======================================================
              function refreshPager(currentPage)
              {
                  currentPage = currentPage || 0;

                  var pageCount = Math.ceil(Math.max($scope.count||0, 0) / Number($scope.itemsPerPage));

                  var pages     = [];
                  var start = 0;
                  var end = (pageCount<3)? pageCount:3;

                  if(currentPage > 0 && currentPage <=pageCount && (pageCount>=3)){
                    start = currentPage-1;
                    end = currentPage+1;
                    if(end>pageCount)
                      end = pageCount;
                    for (var i = start; i <= end; i++) {
                        pages.push({ index : i, text : i+1 });
                    }
                  }else{
                    for (var i = start; i < end; i++) {  //jshint ignore:line
                        pages.push({ index : i, text : i+1 });
                    }
                  }

                  $scope.currentPage = currentPage;
                  $scope.pages       = pages;
                  $scope.pageCount   = pageCount ;
              }
              this.refreshPager =refreshPager;
              //=======================================================================
              //
              //=======================================================================
              function buildQuery () {
                  var q = {};


                  if($scope.searchText ){
                      $scope.searchText = $scope.searchText;
                      q['$text'] = {'$search':'"'+$scope.searchText+'"'};  // jshint ignore:line
                  }
                  q['sideEvent.targets']={'$in':['AICHI-TARGET-'+$scope.target]};
                  q['meta.status']={'$nin':[ 'deleted', 'archived']};

                  return q;
              }

              //============================================================
              //
              //============================================================
            function search(pageIndex) {

                  $scope.loading = true;
                  if(!pageIndex || !Number(pageIndex)) pageIndex=0;

                  $scope.itemsPerPage=Number($scope.itemsPerPage);
                  var q=buildQuery ();//{'location.conference':conference._id};
                  var f = {title:1,'sideEvent.title':1,'sideEvent.id':1,'sideEvent.targets':1,'location.conference':1,start:1,end:1};

                  return mongoStorage.loadDocs('reservations',q, pageIndex,$scope.itemsPerPage,true,$scope.sort,f).then(
                      function(responce) {
                            $scope.count=responce.count;
                            $scope.docs=responce.data;
                            refreshPager(pageIndex);
                            $scope.loading = false;
                            return responce.data;
                      }
                  ); // mongoStorage.getReservations

              } // getReservations
              //=======================================================================
              //
              //=======================================================================
              function searchOld(pageIndex) {
                $scope.targets=targetsData.targets;
                var countryQ ='';

                if($scope.target.length===1)$scope.target2='0'+$scope.target;
                if($scope.schema==='nationalTarget' && $scope.country) countryQ = ' AND government_s:'+$scope.country.toLowerCase();

                var q = 'schema_s:'+$scope.schema + countryQ+' AND (aichiTargets_ss:"AICHI-TARGET-'+$scope.target2 +'" OR aichiTarget_ss:"AICHI-TARGET-'+$scope.target2 +'") AND _state_s:public';

                $scope.loading=true;

                if($scope.searchText)
                    q= q+' AND (resourceTypes_'+locale.toUpperCase()+'_txt:"' + $scope.searchText + '*" OR title_'+locale.toUpperCase()+'_t:"' + $scope.searchText + '*" OR description_t:"' + $scope.searchText + '*" )';


                var queryParameters = {
                  'q': q,
                  'wt': 'json',
//                  'fl': 'isAichiTarget_b,url_ss,title_s,publicationYear_i,resourceTypes_'+locale.toUpperCase()+'_ss',
                  'sort': $scope.sort,//'title_s asc',
                  'start': pageIndex * $scope.itemsPerPage,
  								'rows': $scope.itemsPerPage,
                };

                  $http.get('/api/v2013/index/select', {
                    params: queryParameters,
                    // cache: true
                  }).success(function(data) {


                    $scope.count = data.response.numFound;
                    $scope.docs  = data.response.docs;

                    if($scope.schema ==='measures'){

                          if($scope.targets[Number($scope.target)+1].activities){

                            _.each($scope.targets[Number($scope.target)+1].activities,function(meas){

                                meas.countryObj=_.find($scope.countries,{'name':meas.country});

                                meas.source ="NBSAPS";
                                meas.sourceUri ="https://www.cbd.int/nbsap/targets/default.shtml";
                            });

                            $scope.count =  $scope.count+$scope.targets[Number($scope.target)+1].activities.length;
                            $scope.docs  =  $scope.docs.concat($scope.targets[Number($scope.target)+1].activities);
                          }
                    }

                    refreshPager(pageIndex);
                    $scope.loading = false;

                  });
              }// search
              this.search = search;

            }
        };
    }]);

});