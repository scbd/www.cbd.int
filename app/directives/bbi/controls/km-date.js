import app from '~/app';
import template from './km-date.html';
import 'bootstrap-datepicker';
  
  //============================================================
  //
  //
  //============================================================
  app.directive('kmDate', [function() {
    return {
      restrict: 'EAC',
      template: template,
      replace: true,
      transclude: false,
      scope: {
        binding: '=ngModel',
        placeholder: '@',
        ngDisabledFn: '&ngDisabled',
        ngChange: '&',
        startDate: '=?',
        endDate: '=?'
      },
      link: function($scope, $element, $attr) {
        $element.datepicker({
          format: "yyyy-mm-dd",
          autoclose: true
        }).on('changeDate', function(event) {
          $element.find('input').focus();
        });

        if($attr.hasOwnProperty('startDate'))
          $scope.$watch('startDate', function(newVal) {
          if (newVal)
            $element.datepicker('setStartDate',newVal);
        });

        $scope.$watch('endDate', function(newVal) {
          if (newVal)
            $element.datepicker('setEndDate',newVal);
        });

      },
      controller: ["$scope", function($scope) {}]
    };
  }]);

