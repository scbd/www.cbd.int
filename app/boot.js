(function(document) { 'use strict';

require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'authentication'  : 'services/authentication',
        'angular'         : 'libs/angular-flex/angular-flex',
        'ngRoute'         : 'libs/angular-route/angular-route.min',
        'ngCookies'       : 'libs/angular-cookies/angular-cookies.min',
        'ngAnimate'       : 'libs/angular-animate/angular-animate.min',
        'ngSanitize'      : 'libs/angular-sanitize/angular-sanitize.min',
        'ngDialog'        : 'libs/ng-dialog/js/ngDialog.min',
        'text'            : 'libs/requirejs-text/text',
        'css'             : 'libs/require-css/css.min',
        'jquery'          : 'libs/jquery/dist/jquery.min',
        'bootstrap'       : 'libs/bootstrap/dist/js/bootstrap.min',
        'lodash'          : 'libs/lodash/lodash.min',
        'bootstrap-notify': 'libs/remarkable-bootstrap-notify/bootstrap-notify.min',
        'nprogress'       : 'libs/nprogress/nprogress',
        'moment'          : 'libs/moment/min/moment.min',
        'moment-timezone' : 'libs/moment-timezone/builds/moment-timezone-with-data.min',
        'rangy'           : 'libs/rangy-release/rangy-core.min'
    },
    shim: {
        'libs/angular/angular.min' : { deps : ['jquery'] },
        'angular'              : { deps : ['libs/angular/angular.min'] },
        'ngRoute'              : { deps : ['angular'] },
        'ngCookies'            : { deps : ['angular'] },
        'ngAnimate'            : { deps : ['angular'] },
        'ngSanitize'           : { deps : ['angular'] },
        'ngDialog'             : { deps : ['angular', 'css!libs/ng-dialog/css/ngDialog.min', 'css!libs/ng-dialog/css/ngDialog-theme-default.css'] },
        'bootstrap'            : { deps : ['jquery' ] },
        'bootstrap-notify'     : { deps : ['jquery', 'bootstrap'] }
    },
});

define('underscore', ['lodash'], function(_) {
    return _;
});

define('dropbox-dropins', function(){
    if(window.Dropbox)
        window.Dropbox.appKey = "uvo7kuhmckw68pl"; //registration@cbd.int
    return window.Dropbox;
});

// BOOT
require(['nprogress'], function(p) { p.start(); });
require(['angular', 'app', 'bootstrap', 'routes', 'template'], function(ng, app) {

    ng.element(document).ready(function(){
        ng.bootstrap(document, [app.name]);
    });

});
})(document);

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
