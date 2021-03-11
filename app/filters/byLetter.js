import app from '~/app'
import _ from 'lodash'

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
