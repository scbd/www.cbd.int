var cdnHost = 'https://cdn.cbd.int/';
require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'app'            : 'js/apps/national-reports/app',
        'authentication' : 'services/authentication',
        'angular-flex'    : 'libs/angular-flex/angular-flex',
        'angular'         : cdnHost + 'angular@1.5.6/angular.min',
        'ngRoute'         : cdnHost + 'angular-route@1.5.6/angular-route.min',
        'ngCookies'       : cdnHost + 'angular-cookies@1.5.6/angular-cookies.min',
        'ngSanitize'      : cdnHost + 'angular-sanitize@1.5.6/angular-sanitize.min',
        'async'          : 'libs/requirejs-plugins/src/async',
        'text'           : 'libs/requirejs-text/text',
        'jquery'         : 'libs/jquery/dist/jquery.min',
        'bootstrap'       : cdnHost + 'bootstrap@3.3.6/dist/js/bootstrap.min',
        'moment'          : cdnHost + 'moment@2.6.0/min/moment.min',
        'lodash'          : cdnHost + 'lodash@3.10.1/index',
        'angular-flex'    : 'libs/angular-flex/angular-flex',

        'ammap3WorldHigh'     : 'directives/reporting-display/worldEUHigh',
        'ammap3'              : 'libs/ammap3/ammap/ammap',
        'ammap-theme'         : 'libs/ammap3/ammap/themes/light',
        'ammap-resp'          : 'libs/ammap3/ammap/plugins/responsive/responsive',
        'ammap-export'        : 'libs/ammap3/ammap/plugins/export/export.min',
        'ammap-ex-fabric'     : 'libs/ammap3/ammap/plugins/export/libs/fabric.js/fabric.min',
        'ammap-ex-filesaver'  : 'libs/ammap3/ammap/plugins/export/libs/FileSaver.js/FileSaver.min',
        'ammap-ex-pdfmake'    : 'libs/ammap3/ammap/plugins/export/libs/pdfmake/pdfmake.min',
        'ammap-ex-vfs-fonts'  : 'libs/ammap3/ammap/plugins/export/libs/pdfmake/vfs_fonts',
        'ammap-ex-jszip'      : 'libs/ammap3/ammap/plugins/export/libs/jszip/jszip.min',
        'ammap-ex-xlsx'       : 'libs/ammap3/ammap/plugins/export/libs/xlsx/xlsx.min'
    },
    shim: {
        'angular'              : { deps : ['jquery'], exports: 'angular' },
        'angular-flex'         : { deps : ['angular', 'jquery'] },
        'ngRoute'              : { deps : ['angular-flex'] },
        'ngCookies'            : { deps : ['angular-flex'] },
        'ngAnimate'            : { deps : ['angular-flex'] },
        'bootstrap'            : { deps : ['jquery' ] },
        'moment'               : { deps: ['jquery' ] },
        'ammap3WorldHigh'      : { deps: ['ammap3'] },
        'ammap-theme'          : { deps: ['ammap3']},
        'ammap-resp'           : { deps: ['ammap3']},
        'ammap-export'         : { deps: ['ammap3']},
    }
});

// BOOT

require(['angular', 'app', 'bootstrap', 'js/apps/national-reports/routes', 'views/reports/template'], function(ng, app) {

        ng.element(document).ready(function(){
            ng.bootstrap(document, [app.name]);
        });
});
define('underscore', ['lodash'], function(_) { console.log('Deprecated: use lodash'); return _; });
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