define(['app'], function(app) {
  'use strict';

  app.directive('sorter',[function() {
  return {
   restrict: 'E',
   scope:{binding:'=ngModel'},
   template:'<span class="text-nowrap" ng-click="setSort()" ><a ><label style="cursor:pointer;"> {{name}}:</label></a> <a ng-if="isSelected()" style="cursor:pointer;"><span><i ng-if="direction"  class="fa fa-caret-down"></i><i ng-if="!direction" class="fa fa-caret-up"></i></a></span></span>',
   link: function($scope,$element,$attrs) {

        $scope.name=$attrs.labelName;
        $scope.property=$attrs.property;
        $scope.direction=true;

        //============================================================
        //
        //============================================================
        $scope.setSort =  function (){
          if(!$scope.direction)
            $scope.direction=true;
          else
            $scope.direction=false;


          $scope.binding=$scope.property;
          if($scope.direction)
            $scope.binding =$scope.binding + ' asc';
          else
            $scope.binding =$scope.binding + ' desc';

        };

        //============================================================
        //
        //============================================================
        function isSelected() {

            if($scope.binding && $scope.binding.indexOf($scope.property)>-1)
              return true;
            else
              return false;

        }
        $scope.isSelected=isSelected;


     }
    };
  }]);
}); // define
