require.config({ waitSeconds: 120, baseUrl : '/app/js' });

require(["apps/generic-config"], function() { 'use strict';

    // CONFIG

    require.config({
        paths: {
            'app'  : 'apps/national-reports/app',
            'boot' : 'apps/generic-boot',
            'angular-growl'   : '../libs/angular-growl/build/angular-growl.min',
            'angular-moment'  : '../libs/angular-moment/angular-moment.min',
            'moment'          : '../libs/moment/min/moment.min',
        },
        shim: {
            'angular-growl'   : { 'deps': ['angular'] },
            'angular-moment'  : { 'deps': ['angular', 'moment'] },
            'moment'          : { 'deps': ['jquery' ] }
        },
        config : {
            boot : {
                modules : ['apps/national-reports/routes', '../template.html']
            }
        }
    });

    // BOOT

    require(['boot']);
});
