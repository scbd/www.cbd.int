define(['app', 'services/conference-service'], function(app) { 'use strict';

	return ['$http','conferenceService','$filter', function( $http,conferenceService,$filter) {

		var _ctrl 		= this;

    $http.get('/api/v2015/countries',{ cache: true })
      .then(function(o){return $filter('orderBy')(o.data, 'name.en');})
        .then(function(res){_ctrl.countries = res})


	}];
});
