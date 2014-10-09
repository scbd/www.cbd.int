require.config({ waitSeconds: 5*60, baseUrl : '/app/js' });

require(["apps/generic-config"], function() { 'use strict';

    // CONFIG

    require.config({
        paths: {
            'app'  : 'apps/www/app',
            'boot' : 'apps/generic-boot',
            'angular-growl'   : '../libs/angular-growl/build/angular-growl.min',
            'angular-moment'  : '../libs/angular-moment/angular-moment.min',
            'nprogress'       : '../libs/nprogress/nprogress',
            'dropbox-dropins' : 'https://www.dropbox.com/static/api/2/dropins'
        },
        shim: {
            'angular-growl'   : { 'deps': ['angular'] },
            'angular-moment'  : { 'deps': ['angular', 'moment'] },
            'dropbox-dropins' : {
                deps: [],
                exports: "Dropbox",
                init: function () {
                    if(window.Dropbox) {
                        window.Dropbox.appKey = "uvo7kuhmckw68pl"; //registration@cbd.int
                        return window.Dropbox;
                    }
                }
            }
        }
    });

    // BOOT
    require(['nprogress'], function(p) { p.start(); });
    require(['boot']);
});
