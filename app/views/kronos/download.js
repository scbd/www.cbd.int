define(['app', 'services/conference-service'], function(app) {

	return ['$http','conferenceService','$location', function( $http,conferenceService,$location) {

		var _ctrl 		= this;
    _ctrl.host=window.location.origin




$http.post('/api/v2018/kronos/participation-requests/'+encodeURIComponent($location.search().q)+'/sign').then(function(u){
  _ctrl.signed = u.data.signedUrl
  window.location=u.data.signedUrl

  // window.close();
})

	}];
});
