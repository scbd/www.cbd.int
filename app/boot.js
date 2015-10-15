window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'authentication'  : 'services/authentication',
        'angular'         : 'libs/angular-flex/angular-flex',
        'ngRoute'         : 'libs/angular-route/angular-route.min',
        'ngCookies'       : 'libs/angular-cookies/angular-cookies.min',
        'ngAnimate'       : 'libs/angular-animate/angular-animate.min',
        'domReady'        : 'libs/requirejs-domready/domReady',
        'text'            : 'libs/requirejs-text/text',
        'jquery'          : 'libs/jquery/dist/jquery.min',
        'bootstrap'       : 'libs/bootstrap/dist/js/bootstrap.min',
        'underscore'      : 'libs/lodash/lodash.min',
        'angularMoment'   : 'libs/angular-moment/angular-moment.min',
        'bootstrap-notify': 'libs/remarkable-bootstrap-notify/bootstrap-notify.min',
        'nprogress'       : 'libs/nprogress/nprogress',
        'dropbox-dropins' : 'https://www.dropbox.com/static/api/2/dropins'
    },
    shim: {
        'libs/angular/angular.min' : { deps : ['jquery'] },
        'angular'              : { deps : ['libs/angular/angular.min'] },
        'ngRoute'              : { deps : ['angular'] },
        'ngCookies'            : { deps : ['angular'] },
        'ngAnimate'            : { deps : ['angular'] },
        'bootstrap'            : { deps : ['jquery' ] },
        'bootstrap-notify'     : { deps : ['jquery', 'bootstrap'] },
        'angularMoment'        : { deps : ['angular', 'moment'] },
        'dropbox-dropins'      : {
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

require(['angular', 'domReady!', 'bootstrap', 'app', 'routes', 'template'], function(ng, doc) {

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
