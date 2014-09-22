define(['module'], function (module) { 'use strict';

    var config  = module.config();
    var modules = ['domReady!', 'angular', 'app'];

    for(var i in config.modules)
        modules.push(config.modules[i]);

    require(modules, function(document, angular) {

        angular.bootstrap(document, ['app']);
        angular.resumeBootstrap();

    });
});
