import '~/directives/aichi-targets/sorter'
import '~/directives/aichi-targets/pagination'
import '~/providers/locale'
import app from '~/app'
import _ from 'lodash'
import templateHtml from './box-list.html'
import targetsData from '~/data/aichi-targets/targets.json'
import 'css!cdn!npm/flag-icon-css@2.3.0/css/flag-icon.min.css';

    //============================================================
    //
    //============================================================
    app.directive('boxList', ['$http','locale', function($http,locale) {
        return {
            restrict: 'E',
            scope: {
                searchText:'=',
                country:'=?',

            },
            require:'boxList',
            template: templateHtml,
            link: function($scope, $elem,$attrs, ctrl) {

                $scope.currentPage=0;
                $scope.itemsPerPage=3;
                $scope.schema=$attrs.schema;
                $scope.target=$attrs.target;
                $scope.onPage=ctrl.search;

                if(!$scope.country) $scope.country='*';

                if($scope.schema==='resource')
                  $scope.sort='publicationYear_i desc';
                else
                  $scope.sort='title_s asc';

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

                  var pageCount = Math.ceil(Math.max($scope.count||0, 0) / Number($scope.itemsPerPage))-1;

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
              function search(pageIndex) {
                $scope.targets=targetsData.targets;
                var countryQ ='';

                if($scope.target.length===1)$scope.target='0'+$scope.target;
                if($scope.schema==='nationalTarget' && $scope.country) countryQ = ' AND government_s:'+$scope.country.toLowerCase();

                var q = 'realm_ss:chm AND schema_s:'+$scope.schema + countryQ+' AND (aichiTargets_ss:"AICHI-TARGET-'+$scope.target +'" OR aichiTarget_ss:"AICHI-TARGET-'+$scope.target +'") AND _state_s:public';

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
                  }).then(function({data}) {


                    $scope.count = data.response.numFound;
                    $scope.docs  = data.response.docs;

                    if($scope.schema ==='measures'){
                          var targetNumber = Number($scope.target)-1;
                          if($scope.targets[targetNumber] && $scope.targets[targetNumber].activities){

                            _.each($scope.targets[targetNumber].activities,function(meas){

                                meas.countryObj=_.find($scope.countries,{'name':meas.country});

                            });

                            $scope.count =  $scope.count+$scope.targets[targetNumber].activities.length;
                            $scope.docs  =  $scope.docs.concat($scope.targets[targetNumber].activities);
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