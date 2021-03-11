define(['~/app', './fb-timeline.html'], function(app, html) {
  'use strict';
  var _savedHtml;

  return app.directive('fbTimeline', ['$timeout', '$compile', function($timeout, $compile) {
    return {
      restrict: "E",
      template: html,
      replace: true,
      scope: {},
      compile: function($elm) {
        import('~/services/fb').then(function() {
          if (window.FB && window.FB.XFBML)
            window.FB.XFBML.parse();
        });
      }
    };
  }]);
});
