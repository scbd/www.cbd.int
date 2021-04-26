import app from '~/app';
  

  app.directive('onFocusHelper',['$timeout', function($timeout) {
  return {
   restrict: 'A',
   scope:{binding:'=ngModel'},
   link: function($scope, $element,$attrs) {

        if($attrs.start) $element.focusin(onFocusStart);
        else throw 'Error: no start string attribute for onFocusHelper directive';

        //=======================================================================
        //
        //=======================================================================
        function onFocusStart() {
            if (!$scope.binding) {
                $scope.binding = $attrs.start;

                moveCursorToEnd($element);
            }
        }
        $scope.onFocusStart = onFocusStart;



        //=======================================================================
        //
        //=======================================================================
        function moveCursorToEnd(el) {
            $timeout(function() {
                if (typeof el.selectionStart == "number") {
                    el.selectionStart = el.selectionEnd = el.value.length;
                } else if (typeof el.createTextRange != "undefined") {
                    el.focus();
                    var range = el.createTextRange();
                    range.collapse(false);
                    range.select();
                }
                el.select();
            });
        }

     }
    };
  }]);
 // define
