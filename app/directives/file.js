define(['app'], function(app) { 'use strict';

	return app.directive('type', function() {
	    return {
	        restrict: 'A',
	        replace: true,
	        require: '?ngModel',
	        link: function($scope, element, attr, ctrl) {

                if(element.prop("tagName")!=="INPUT") return;
                if(attr.type              !=="file")  return;

                if(!ctrl) return;

	            element.bind('change', function() {
	                $scope.$apply(function() {

	                    if(attr.multiple) ctrl.$setViewValue(element[0].files);
	                    else              ctrl.$setViewValue(element[0].files[0]);

                        if($scope.$eval(attr.autoReset))
                            element.val('');
	                });
	            });
	        }
	    };
	});
});
