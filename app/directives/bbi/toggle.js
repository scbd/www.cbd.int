
define(['app'], function(app) {
  'use strict';

app.directive('toggle', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      if (attrs.toggle=="tooltip"){
        $(element).tooltip({
          title:attrs.title,
          html:attrs.html,
          container:attrs.container,
          toggle:attrs.toggle
        });
      }
      if (attrs.toggle=="popover"){
        $(element).popover();
      }
    }
  };
});
}); // define