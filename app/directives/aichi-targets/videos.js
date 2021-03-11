import 'magnific-popup'
import app from '~/app'

    app.directive('videosLoaded', function() {
        return {
            restrict: 'A',
            link: function (scope) {
                if (scope.$last){
                    $('.carousel-inner').each(function() {
                        $(this).magnificPopup({
                            delegate: '.vimeo',
                            disableOn: 700,
                            type: 'iframe',
                            mainClass: 'mfp-fade',
                            removalDelay: 160,
                            preloader: false,

                            fixedContentPos: false,
                            iframe: {
                               markup: '<div class="mfp-iframe-scaler">'+
                                          '<div class="mfp-close"></div>'+
                                          '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
                                          '<div class="mfp-title">Some caption</div>'+
                                        '</div>'
                            }
                       });
                  });

                  $('.carousel').carousel({
                          interval: 4500
                  });

                }
            }

        };
    });