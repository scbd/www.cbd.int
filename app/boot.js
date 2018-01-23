define(['angular', 'app', 'jquery', 'bootstrap', 'routes', 'template', 'ngSanitize', 'ngRoute'], function(ng, app){

    ng.element(document).ready(function(){
        console.log('boot');
        ng.bootstrap(document, [app.name]);
    });

    return app;
});
