define(['app', 'text!./fisheye.html', 'angular', 'interface'], function(app, templateHtml) { 'use strict';

    //============================================================
    //
    //============================================================
    app.directive('fishEye',  function() {
        return {
            restrict: 'EA',
            template : templateHtml,
            link: function (scope, elem, attrs) {

                $(elem).Fisheye(
    				{
    					maxWidth: 42,
    					items: 'a',
    					itemsText: 'span',
    					container: '.fisheyeContainter',
    					itemWidth: parseInt(attrs.maxWidth),
    					proximity: 50,
    					halign : 'center'
    				}
    			);
            },
            controller: function ($scope, $location) {
                //============================================================
                //
                //============================================================
                $scope.goTo = function (targetId) {
                    if(targetId); {
                        $location.path('/target/' + targetId);
                    }
                };
            }
        };
    });

});
