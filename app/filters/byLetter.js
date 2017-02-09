define(['app','lodash', ], function (app,_) { 'use strict';

    //##################################################################
      app.filter('filterByLetter',['locale', function (locale) {
          return function (arr, letter) {

              if (!arr || !arr.length)
                  return null;


             if(!letter || letter==='ALL' )
                return arr;
              return _.filter(arr,function(item) {
                return item.title[locale].charAt(0) === letter;
              });
          };
      }]);


}); //define