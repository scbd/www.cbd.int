import template from './search-filter-keywords.html';
import app from '~/app';
import _ from 'lodash'; 

    app.directive('searchFilterKeywords', ['$location', function ($location) {

    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : '^search',
        scope: {

            title: '@title',
            value: '=ngModel',
            query: '=query',

        },
      link : function ($scope, $element, $attr, searchCtrl)//jshint ignore:line
      {
            $scope.textOn=false;
            if(Array.isArray($location.search().keywords)){
                                $location.replace();
                _.each($location.search().keywords,function(text){

                  $location.search("keywords", getLocationArray(text.trim()) || null);
                  applyKeywords(text);
                });
            }else if($location.search().keywords)
               applyKeywords( $location.search().keywords);

            $scope.filters=searchCtrl.filters;
            $scope.$watch('filters.length',function(){
              $location.replace();
              $location.search("keywords", getLocationArray() || null);
            });

            $scope.$watch('value', function (keywords) {
                if(!$scope.value)return;
                $location.replace();
                $location.search("keywords", getLocationArray(keywords.trim()) || null);

                applyKeywords(keywords);
                $scope.clearSearch();
            });

            function applyKeywords(keywords)
            {
                $scope.value = keywords;
                if(keywords)
                    searchCtrl.addSubQuery({name:'keywords',title:keywords,identifier:'(title_t:"' + keywords + '*" OR description_t:"' + keywords + '*" OR text_EN_txt:"' + keywords + '*")'});

                searchCtrl.destroyPages();
                searchCtrl.search();
            }

            function getLocationArray(newText){
              var keyWordArray =[];
              _.each($scope.filters,function(filter){
                  if(filter.name==='keywords' && keyWordArray.indexOf(filter.title)<0)
                      keyWordArray.push(filter.title);
              });
              if(newText && keyWordArray.indexOf(newText)<0)
                keyWordArray.push(newText);
              if(!keyWordArray.length) return null;

             return keyWordArray;
            }
            //======================================================================
            //
            //======================================================================
            $scope.clearSearch= function () {
                if($scope.value){
                  $scope.value=''
                  $scope.textOn='';
                }
                ;
            };//$scope.icon

      }//link
    }; // return
  }]);  //app.directive('
// define
