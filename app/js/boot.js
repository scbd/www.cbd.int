'use strict';

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
  baseUrl : '/app/js',
  paths: {
    'angular'         : '../libs/angular/angular',
    'angular-route'   : '../libs/angular-route/angular-route',
    'angular-cookies' : '../libs/angular-cookies/angular-cookies',
    'async'           : '../libs/requirejs-plugins/src/async',
    'domReady'        : '../libs/requirejs-domready/domReady',
    'text'            : '../libs/requirejs-text/text',
    'jquery'          : '../libs/jquery/jquery',
    'bootstrap'       : '../libs/bootstrap-sass/dist/js/bootstrap.min',
    'underscore'      : '../libs/underscore/underscore',
    'angular-growl'   : '../libs/angular-growl/build/angular-growl',
    'angular-moment'  : '../libs/angular-moment/angular-moment',
    'moment'          : '../libs/moment/moment'
  },
  shim: {
    'angular'         : { 'deps': ['jquery'], 'exports': 'angular' },
    'angular-route'   : { 'deps': ['angular'] },
    'angular-cookies' : { 'deps': ['angular'] },
    'angular-moment'  : { 'deps': ['moment'] },
    'bootstrap'       : { 'deps': ['jquery'] }
  }
});

require(['angular', 'angular-route', 'angular-cookies', 'bootstrap', 'domReady', 'text'], function (ng) {

  // NOTE: place operations that need to initialize prior to app start here using the `run` function on the top-level module

  require(['domReady!', 'app', 'app_routes', '../template.html'], function (document) {
    ng.bootstrap(document, ['app']);
    ng.resumeBootstrap();
  });
});