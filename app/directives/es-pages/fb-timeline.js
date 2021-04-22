import app from '~/app';
import html from './fb-timeline.html'; 

  export default app.directive('fbTimeline', ['$timeout', '$compile', function($timeout, $compile) {
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

