(function(document) { 'use strict';

if(/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) { console.log = function(){}; }

var gitVersion = document.documentElement.attributes['git-version'].value;

require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'authentication'  : 'services/authentication',
        'angular'         : 'libs/angular/angular.min',
        'angular-flex'    : 'libs/angular-flex/angular-flex',
        'ngRoute'         : 'libs/angular-route/angular-route.min',
        'ngCookies'       : 'libs/angular-cookies/angular-cookies.min',
        'ngAnimate'       : 'libs/angular-animate/angular-animate.min',
        'ngSanitize'      : 'libs/angular-sanitize/angular-sanitize.min',
        'ngDialog'        : 'libs/ng-dialog/js/ngDialog.min',
        'text'            : 'libs/requirejs-text/text',
        'css'             : 'libs/require-css/css.min',
        'json'            : 'libs/requirejs-plugins/src/json',
        'bootstrap'       : 'libs/bootstrap/dist/js/bootstrap.min',
        'lodash'          : 'libs/lodash/lodash.min',
        'dragula'         : 'libs/dragula.js/dist/dragula',
        'bootstrap-notify': 'libs/remarkable-bootstrap-notify/bootstrap-notify.min',
        'moment'          : 'libs/moment/min/moment.min',
        'moment-timezone' : 'libs/moment-timezone/builds/moment-timezone-with-data-2010-2020.min',
        'rangy'           : 'libs/rangy-release/rangy-core.min',
        'shim'            : 'libs/require-shim/src/shim',
        'interface'       : 'js/interface',
        'magnific-popup'  : 'libs/magnific-popup/dist/jquery.magnific-popup.min',
        'jquery'          : 'libs/jquery/dist/jquery.min',
        'jquery-migrate'  : 'libs/jquery-migrate/jquery-migrate.min',
        'ammap3WorldHigh' : 'directives/reporting-display/worldEUHigh',
        'alasql'          : 'libs/alasql/dist/alasql.min',
        'js-xlsx'         : 'libs/js-xlsx/dist/xlsx.min',
        'js-zip'          : 'libs/js-xlsx/dist/jszip',
        'ods'             : 'libs/js-xlsx/dist/ods',
        'linqjs'          : 'libs/linqjs/linq',
        'ngInfiniteScroll': 'libs/ngInfiniteScroll/build/ng-infinite-scroll',
        'ngSmoothScroll'  : 'libs/ngSmoothScroll/lib/angular-smooth-scroll',
        'bootstrap-datepicker': 'libs/bootstrap-datepicker/js/bootstrap-datepicker',
        'toastr'          : 'libs/angular-toastr/dist/angular-toastr.tpls.min',
        'ammap3'          : 'libs/ammap3/ammap/ammap',
        'ammap-theme'     : 'libs/ammap3/ammap/themes/light',
        'ngMeta'          : 'libs/ngMeta/dist/ngMeta.min',
        'facebook'        : '//connect.facebook.net/en_US/sdk',
        'gmapsapi'        : 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCyD6f0w00dLyl1iU39Pd9MpVVMOtfEuNI&libraries=places',

    },
    shim: {
        'angular'              : { deps : ['jquery'], exports: 'angular' },
        'angular-flex'         : { deps : ['angular', 'jquery'] },
        'ngRoute'              : { deps : ['angular-flex'] },
        'ngCookies'            : { deps : ['angular-flex'] },
        'ngAnimate'            : { deps : ['angular-flex'] },
        'ngSanitize'           : { deps : ['angular-flex'] },
        'ngDialog'             : { deps : ['angular-flex' ]},// 'css!libs/ng-dialog/css/ngDialog.min', 'css!libs/ng-dialog/css/ngDialog-theme-default.css'] },
        'bootstrap'            : { deps : ['jquery' ] },
        'bootstrap-notify'     : { deps : ['jquery', 'bootstrap'] },
        'moment-timezone'      : { deps : ['moment'] },
        'jquery-migrate'       : { deps : ['jquery']},
        'interface'            : { deps : ['jquery-migrate']},
        'magnific-popup'       : { deps : ['jquery']},
        'dragula'              : { deps : ['css!libs/dragula.js/dist/dragula.css']},
        'alasql'               : { deps : ['js-xlsx']},
        'js-xlsx'              : { deps : ['js-zip', 'ods']},
        'toastr'               : { deps : ['angular-flex'] },
        'ngSmoothScroll'       : { deps : ['angular-flex'] },
        'ngInfiniteScroll'     : { deps : ['angular-flex'] },
        'gmapsapi'             : { exports: 'google'},
        'facebook'             : { exports: 'FB'}
    },
    packages: [
        { name: 'amchart', main: 'amcharts', location : 'libs/amcharts3/amcharts/' },
        { name: 'ammap'  , main: 'ammap'   , location : 'libs/ammap3/ammap' }
    ],
    urlArgs: 'v=' + gitVersion
});

define('xlsx', ['js-zip', 'ods'], function (jszip, ods) {
    window.JSZip = jszip;
    window.ODS   = ods;
});

define('underscore', ['lodash'], function(_) { console.log('Deprecated: use lodash'); return _; });

if (!require.defined('_slaask'))
    define("_slaask", window._slaask);

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
