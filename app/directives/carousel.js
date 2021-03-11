define(['~/app', 'text!./carousel.html','moment','~/filters/moment'], function(app, html,moment) { 'use strict';

	return app.directive('carousel', ['$timeout','$location', function($timeout,$location) {
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


                var killWatch = $scope.$watch('items', function() {
					if($scope.items && $scope.items.length){
						 next(0);
						 killWatch();
					 }
				});
                $scope.$on   ('$destroy', clearTimer);
                $scope.next  = next;
                $scope.index = 0;

                var timer = null;
                var delay = parseInt($scope.delay);

                if(!delay || delay<0 || isNaN(delay))
                    delay = 10;

				//============================================================
				//
				//============================================================
				function goTo (url) {

					$location.url(url);
				}
				$scope.goTo=goTo;
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
                function diff(s,e) {

                    var d = Number(moment(e).diff(moment(s),'days'));
					if(d>0)d=d+1
					return d;
                }
				$scope.diff=diff;
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
