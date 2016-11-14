(function(document) { 'use strict';

require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'authentication'  : 'services/authentication',
        'ngRoute'         : 'libs/angular-route/angular-route.min',
        'ngCookies'       : 'libs/angular-cookies/angular-cookies.min',
        'ngAnimate'       : 'libs/angular-animate/angular-animate.min',
        'ngSanitize'      : 'libs/angular-sanitize/angular-sanitize.min',
        'ngDialog'        : 'libs/ng-dialog/js/ngDialog.min',
        'text'            : 'libs/requirejs-text/text',
        'css'             : 'libs/require-css/css.min',
        'bootstrap'       : 'libs/bootstrap/dist/js/bootstrap.min',
        'lodash'          : 'libs/lodash/lodash.min',
        'bootstrap-notify': 'libs/remarkable-bootstrap-notify/bootstrap-notify.min',
        'moment'          : 'libs/moment/min/moment.min',
        'moment-timezone' : 'libs/moment-timezone/builds/moment-timezone-with-data.min',
        'rangy'           : 'libs/rangy-release/rangy-core.min',
        'shim'            : 'libs/require-shim/src/shim',
        'interface'       : 'js/interface',
        'magnific-popup'  : 'libs/magnific-popup/dist/jquery.magnific-popup.min',
        'jquery-migrate'  : 'libs/jquery-migrate/jquery-migrate.min',
        'ammap3WorldHigh' : 'directives/reporting-display/worldEUHigh',
        'alasql'          : 'libs/alasql/dist/alasql.min',
        'js-xlsx'         : 'libs/js-xlsx/dist/xlsx.min',
        'js-zip'          : 'libs/js-xlsx/dist/jszip',
        'ods'             : 'libs/js-xlsx/dist/ods'
    },
    shim: {
        'ngRoute'              : { deps : ['angular'] },
        'ngCookies'            : { deps : ['angular'] },
        'ngAnimate'            : { deps : ['angular'] },
        'ngSanitize'           : { deps : ['angular'] },
        'ngDialog'             : { deps : ['angular' ]},// 'css!libs/ng-dialog/css/ngDialog.min', 'css!libs/ng-dialog/css/ngDialog-theme-default.css'] },
        'bootstrap'            : { deps : ['jquery' ] },
        'bootstrap-notify'     : { deps : ['jquery', 'bootstrap'] },
        'jquery-migrate'       : { deps : ['jquery']},
        'interface'            : { deps : ['jquery-migrate']},
        'magnific-popup'       : { deps : ['jquery']},
        'alasql'               : { deps : ['js-xlsx']},
        'js-xlsx'              : { deps : ['js-zip', 'ods']}

    },
    packages: [
    { name: 'amchart', main: 'amcharts', location : 'libs/amcharts3/amcharts/' },
    { name: 'ammap'  , main: 'ammap'   , location : 'libs/ammap3/ammap' }
]
});

define('jquery',  function() { return window.$; });
define('angular', function() { return window.angular; });

define('xlsx', ['js-zip', 'ods'], function (jszip, ods) {
    window.JSZip = jszip;
    window.ODS   = ods;
});

define('underscore', ['lodash'], function(_) { console.log('Deprecated: use lodash'); return _; });

define('dropbox-dropins', ['https://www.dropbox.com/static/api/2/dropins.js'], function(){
    if(window.Dropbox)
        window.Dropbox.appKey = "uvo7kuhmckw68pl"; //registration@cbd.int
    return window.Dropbox;
});

// BOOT
require(['angular', 'app', 'bootstrap', 'routes', 'template', 'ngSanitize', 'ngRoute', 'providers/extended-route'], function(ng, app) {
    ng.element(document).ready(function(){
        ng.bootstrap(document, [app.name]);
    });
});

//COP optimizer
require([
    'lodash',
    'authentication',
    'ngDialog',
    'moment',
    'moment-timezone',
    'filters/lstring',
    'filters/moment',
    'directives/checkbox', 'text!directives/checkbox.html',
    'directives/print-smart/print-smart-checkout', 'text!directives/print-smart/print-smart-checkout.html',
    'views/meetings/documents/agenda',
    'views/meetings/documents/documents',
    'views/meetings/documents/meeting-document',
]);

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
