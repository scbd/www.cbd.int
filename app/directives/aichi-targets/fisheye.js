import 'interface'
import app from 'app'
import templateHtml from './fisheye.html'

    //============================================================
    //
    //============================================================
    app.directive('fishEye', ['$window', function($window) {
        return {
            restrict: 'EA',
            template: templateHtml,
            link: function(scope, elem) {

                buildFishEye();

                angular.element($window).bind('resize', function() {
                    buildFishEye();
                });

                //============================================================
                //
                //============================================================
                function buildFishEye() {
                    $(elem).Fisheye({
                        maxWidth: 42,
                        items: 'a',
                        itemsText: 'span',
                        container: '.fisheyeContainter',
                        itemWidth: calcWidth(),
                        proximity: 50,
                        halign: 'center'
                    });
                } //buildFishEye

                //============================================================
                // 1160 largest
                // > = 1200  =58
                // >= 992 && < 1200 = ?
                // >= 768 && < 992 = ?
                // >= 480 && < 768  = ?
                //============================================================
                function calcWidth() {
                    var w = $window.innerWidth;
                    if (w >= 1200)
                        return 58;
                    else if (w >= 992 && w < 1200)
                        return 48;
                    else if (w >= 768 && w < 992)
                        return 37;
                    else if (w >= 571 && w < 768)
                        return 28;
                    else if (w >= 410 && w < 571)
                        return 20;
                    else if (w >= 360 && w < 410)
                        return 18;
                    else
                        return 16;
                }
            },

            controller: function($scope, $location) {
                //============================================================
                //
                //============================================================
                $scope.goTo = function(targetId) {
                    if (targetId); {
                        $location.path('/target/' + targetId);
                    }
                };
            }
        };
    }]);