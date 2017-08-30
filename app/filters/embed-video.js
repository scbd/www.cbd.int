define(['app'], function (app) { 'use strict';

    //##################################################################
      app.filter('embedVideo',[function () {
          return function (url) {
              var matches;
              if(~url.indexOf('youtube') || ~url.indexOf('youtu.be')){

                    matches=url.match(/v=([0-9a-zA-Z]+)/);
                    if(!matches){
                        var parts = url.split("/");

                        var result = parts[parts.length - 1];

                        if(result)
                            if(!matches){matches =[];
                                matches.push(result)
                            }
                            else matches.push(result)
                    }

              }
            if(matches)
                return '/es/video/'+matches[0];
            else return '/es/video/'+encodeURIComponent(url);


          };
      }]);


}); //define