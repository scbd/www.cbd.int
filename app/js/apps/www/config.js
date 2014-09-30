require.config({ waitSeconds: 120, baseUrl : '/app/js' });

require(["apps/generic-config"], function() { 'use strict';

    // CONFIG

    require.config({
        paths: {
            'app'  : 'apps/www/app',
            'boot' : 'apps/generic-boot',
            'nprogress' : '../libs/nprogress/nprogress',
            'dropbox-dropins' : 'https://www.dropbox.com/static/api/2/dropins'
        },
        shim: {
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
    require(['nprogress'], function(p) { p.start() });
    require(['boot']);
});
