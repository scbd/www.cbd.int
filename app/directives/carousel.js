define(['app', 'text!./carousel.html'], function(app, html) { 'use strict';

	return app.directive('carousel', ['$timeout', function($timeout) {
		return {
            //require: 'ngModel',
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                items : "<ngModel",
                delay : "@delay"
            },
			link: function ($scope, el) {


                $scope.$watch('::items', function() { next(0); });
                $scope.$on   ('$destroy', clearTimer);
                $scope.next  = next;
                $scope.index = 0;

                var timer = null;
                var delay = parseInt($scope.delay);

                if(!delay || delay<0 || isNaN(delay))
                    delay = 10;

                //================
                //
                //================
                function next(offset) {

                    clearTimer();

                    offset = offset || 0;

                    var index = $scope.index;
                    var size  = $scope.items.length;

                    index += offset;

                    if(index<0) index += size;
                    if(index<0) index  = 0;

                    index = index % size;

                    $scope.index = index;
                    $scope.items[index].visible = true;

                    timer = $timeout(function() { next(1); }, delay*1000);
                }

                //================
                //
                //================
                function clearTimer() {
                    $timeout.cancel(timer);
                }
			}
		};
	}]);
});
