define(['app'], function(app) {

  app.directive('printSmartHelp', function() {
    return {
      restrict : "AC",
      require: '^printSmart',
      replace : true,
      templateUrl : "/app/views/print-smart/print-smart-help.html"
    };
  });

});