import module from '~/app';
import _ from 'lodash';
  export default module.factory('geojson', ['$http', '$locale',
    function($http, $locale) {
      var geojson = {};

      geojson.getRegionByName = function(regionName, cb) {
        return $http.get('regions/' + regionName + '.geojson')
          .then(function(response) {
            cb(response.data);
          });
      };

      return geojson;
    }
  ]);

