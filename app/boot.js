window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 120,
    baseUrl : '/app/',
    paths: {
        'angular'         : 'libs/angular/angular.min',
        'angular-route'   : 'libs/angular-route/angular-route.min',
        'angular-cookies' : 'libs/angular-cookies/angular-cookies.min',
        'angular-animate' : 'libs/angular-animate/angular-animate.min',
        'async'           : 'libs/requirejs-plugins/src/async',
        'domReady'        : 'libs/requirejs-domready/domReady',
        'text'            : 'libs/requirejs-text/text',
        'jquery'          : 'libs/jquery/dist/jquery.min',
        'bootstrap'       : 'libs/bootstrap/dist/js/bootstrap.min',
        'underscore'      : 'libs/underscore/underscore',
        'angular-growl'   : 'libs/angular-growl/build/angular-growl.min',
        'angular-moment'  : 'libs/angular-moment/angular-moment.min',
        'nprogress'       : 'libs/nprogress/nprogress',
        'dropbox-dropins' : 'https://www.dropbox.com/static/api/2/dropins'
    },
    shim: {
        'angular'         : { 'deps': ['jquery' ], 'exports': 'angular' },
        'angular-route'   : { 'deps': ['angular'] },
        'angular-cookies' : { 'deps': ['angular'] },
        'angular-animate' : { 'deps': ['angular'] },
        'angular-moment'  : { 'deps': ['moment' ] },
        'bootstrap'       : { 'deps': ['jquery' ] },
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
    },
});

// BOOT

require(['nprogress'], function(p) { p.start(); });

require(['angular', 'domReady!', 'bootstrap', 'app', 'routes', 'template.html'], function(ng, doc) {

    ng.bootstrap(doc, ['app']);
    ng.resumeBootstrap();
});

// MISC

//==================================================
// Protect window.console method calls, e.g. console is not defined on IE
// unless dev tools are open, and IE doesn't define console.debug
//==================================================
(function fixIEConsole() { 'use strict';

    if (!window.console) {
        window.console = {};
    }

    var methods = ["log", "info", "warn", "error", "debug", "trace", "dir", "group","groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd", "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"];
    var noop    = function() {};

    for(var i = 0; i < methods.length; i++) {
        if (!window.console[methods[i]])
            window.console[methods[i]] = noop;
    }
})();
