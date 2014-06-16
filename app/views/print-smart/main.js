'use strict';

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
  waitSeconds: 30,
  baseUrl : '/app/views/print-smart',
  paths: {
    'angular'    : '/app/libs/angular/angular',
    'ngCookies'  : '/app/libs/angular-cookies/angular-cookies',
    'domReady'   : '/app/libs/requirejs-domready/domReady',
    'underscore' : '/app/libs/underscore/underscore',
    'bootstrap'  : '/app/libs/bootstrap-sass/dist/js/bootstrap.min',
    'jquery'     : '/app/libs/jquery/jquery',
  },
  shim: {
    'angular'         : { 'deps': ['jquery'], 'exports': 'angular' },
    'bootstrap'       : { 'deps': ['jquery'] },
    'angular-cookies' : { 'deps': ['angular'] },
  }
});

require(['angular', 'domReady'], function (ng) {

  // NOTE: place operations that need to initialize prior to app start here using the `run` function on the top-level module

  require(['domReady!', 'app', 'print-smart'], function (document) {
    ng.bootstrap(document, ['app']);
    ng.resumeBootstrap();
  });
});