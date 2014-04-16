'use strict';

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    baseUrl : '/app/js',
    paths: {
        'angular'         : '../libs/angular/angular',
        'angular-route'   : '../libs/angular-route/angular-route',
        'angular-cookies' : '../libs/angular-cookies/angular-cookies',
        'domReady'        : '../libs/requirejs-domready/domReady',
        'jquery'          : '../libs/jquery/jquery',
        'bootstrap'       : '../libs/bootstrap-sass/dist/js/bootstrap.min',
        'underscore'      : '../libs/underscore/underscore'
    },
    shim: {
        'angular'         : { 'deps': ['jquery'], 'exports': 'angular' },
        'angular-route'   : { 'deps': ['angular'] },
        'angular-cookies' : { 'deps': ['angular'] },
        'bootstrap'       : { 'deps': ['jquery'] }
    }
});

require(['angular', 'angular-route', 'angular-cookies', 'bootstrap', 'domReady'], function (ng) {

    // NOTE: place operations that need to initialize prior to app start here using the `run` function on the top-level module

    require(['domReady!', 'app', 'app_routes', '../template.html'], function (document) {
        ng.bootstrap(document, ['app']);
        ng.resumeBootstrap();
    });
});