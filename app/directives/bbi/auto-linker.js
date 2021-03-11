import app from '~/app';
import autoLinks from '~/data/bbi/auto-links.json';
  

  app.directive('autoLinker',['$timeout','$compile','$location', function($timeout,$compile,$location) {
  return {
   restrict: 'A',
   link: function($scope, $element) {
        $scope.goTo=function(link){
            $location.path(link);
        }
       for(var i=0; i<autoLinks.length;i++)
       {
          for(var j=0; j<autoLinks[i].texts.length;j++){
              var re = new RegExp(autoLinks[i].texts[j]+'(?!.*?\<\/a\>)',"gi");

              if(autoLinks[i].inApp)
                  $element[0].innerHTML = $element[0].innerHTML.replace(re, '<a class="pointer" href="#" ng-click="goTo(\''+autoLinks[i].uri+'\');">'+autoLinks[i].texts[j]+'</a>');
              else if(autoLinks[i].isEmail)
                  $element[0].innerHTML = $element[0].innerHTML.replace(re, '<a href="mailto:'+autoLinks[i].uri+'" target="_blank">'+autoLinks[i].texts[j]+'</a>');
              else
                  $element[0].innerHTML = $element[0].innerHTML.replace(re, '<a href="'+autoLinks[i].uri+'" target="_blank">'+autoLinks[i].texts[j]+'</a>');
               $compile($element.contents())($scope);
          }
       }
     }
    };
  }]);
 // define
