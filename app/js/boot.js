fixIEConsole();

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
  waitSeconds: 120,
  baseUrl : '/app/js',
  paths: {
    'angular'         : '../libs/angular/angular.min',
    'angular-route'   : '../libs/angular-route/angular-route.min',
    'angular-cookies' : '../libs/angular-cookies/angular-cookies.min',
    'angular-animate' : '../libs/angular-animate/angular-animate.min',
    'angular-growl'   : '../libs/angular-growl/build/angular-growl.min',
    'angular-moment'  : '../libs/angular-moment/angular-moment.min',
    'async'           : '../libs/requirejs-plugins/src/async',
    'domReady'        : '../libs/requirejs-domready/domReady',
    'text'            : '../libs/requirejs-text/text',
    'jquery'          : '../libs/jquery/jquery.min',
    'bootstrap'       : '../libs/bootstrap-sass/dist/js/bootstrap.min',
    'underscore'      : '../libs/underscore/underscore',
    'moment'          : '../libs/moment/min/moment.min',
    'dropbox-dropins' : 'https://www.dropbox.com/static/api/2/dropins'
  },
  shim: {
    'angular'         : { 'deps': ['jquery' ], 'exports': 'angular' },
    'angular-route'   : { 'deps': ['angular'] },
    'angular-cookies' : { 'deps': ['angular'] },
    'angular-animate' : { 'deps': ['angular'] },
    'angular-moment'  : { 'deps': ['moment' ] },
    'bootstrap'       : { 'deps': ['jquery' ] },
	'dropbox-dropins' : { deps: [], exports: "Dropbox",
        init: function () {
            window.Dropbox.appKey = "uvo7kuhmckw68pl"; //registration@cbd.int
			return window.Dropbox;
        }
	}
  }
});

require(['angular', 'domReady'], function (angular) { 'use strict';

  // NOTE: place operations that need to initialize prior to app start here using the `run` function on the top-level module

  var modules     = [ 'domReady!' ];
  var bootModules = angular.extend({ 'app' : true }, window.require_modules || {});

  angular.forEach(bootModules, function(value, key) {

      if(value) {
          modules.push(key);
      }
  });

  require(modules, function (document) {
    angular.bootstrap(document, ['app']);
    angular.resumeBootstrap();
  });

});

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

//==================================================
// Protect window.console method calls, e.g. console is not defined on IE
// unless dev tools are open, and IE doesn't define console.debug
//==================================================
function fixIEConsole() { 'use strict';

	if (!window.console) {
		window.console = {};
	}

	var methods = ["log", "info", "warn", "error", "debug", "trace", "dir", "group","groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd", "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"];
	var noop    = function() {};

  	for(var i = 0; i < methods.length; i++) {
    	if (!window.console[methods[i]]) {
			  window.console[methods[i]] = noop;
    	}
  	}
}
