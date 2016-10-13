define(['app', 'text!./box-list.html','directives/aichi-targets/sorter','directives/aichi-targets/pagination','providers/locale'], function(app, templateHtml) {
    'use strict';

    //============================================================
    //
    //============================================================
    app.directive('boxList', ['$http','locale','$window', function($http,locale,$window) {
        return {
            restrict: 'E',
            scope: {
                // schema:'=',
                // target:'='
                searchText:'='
            },
            require:'boxList',
            template: templateHtml,
            link: function($scope, $elem,$attrs, ctrl) {
                console.log('$attrs.schema',$attrs.schema);
                $scope.currentPage=0;
                $scope.itemsPerPage=3;
                $scope.schema=$attrs.schema;
                $scope.target=$attrs.target;
                $scope.onPage=ctrl.search;
                $scope.sort='title_s asc'

                $scope.$watch('searchText',function(){
                    ctrl.search(0);
                });
                $scope.$watch('sort',function(){
                    if($scope.sort)
                      ctrl.search(0);
                });



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

                if($scope.target.length===1)$scope.target2='0'+$scope.target;

                var q = 'schema_s:'+$scope.schema +' AND aichiTarget_ss:AICHI-TARGET-'+$scope.target2 +' AND _state_s:public';
                $scope.loading=true;

                if($scope.searchText)
                    q= q+' AND (resourceTypes_'+locale.toUpperCase()+'_txt:"' + $scope.searchText + '*" OR title_'+locale.toUpperCase()+'_t:"' + $scope.searchText + '*" OR description_t:"' + $scope.searchText + '*" )';

                //createdBy_s_'+locale.toUpperCase()+'_t:"' + $scope.searchText + '*" OR resourceTypes_'+locale.toUpperCase()+'_t:"' + $scope.searchText + '*" OR authors_'+locale.toUpperCase()+'_t:"' + $scope.searchText + '*" OR



                var queryParameters = {
                  'q': q,
                  'wt': 'json',
                  'fl': 'url_ss,title_s,publicationYear_i,resourceTypes_'+locale.toUpperCase()+'_ss',
                  'sort': $scope.sort,//'title_s asc',
                  'start': pageIndex * $scope.itemsPerPage,
  								'rows': $scope.itemsPerPage,
                };

                  $http.get('https://api.cbddev.xyz/api/v2013/index/select', {
                    params: queryParameters,
                    cache: true
                  }).success(function(data) {
                    $scope.count = data.response.numFound;
                    $scope.docs = data.response.docs;

                    refreshPager(pageIndex);
                    $scope.loading = false;

                  });
              }
              this.search = search;

            }
        };
    }]);

});