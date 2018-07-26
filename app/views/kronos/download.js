define(['app', 'services/conference-service'], function(app) {

	return ['$http','conferenceService','$location', function( $http,conferenceService,$location) {

		var _ctrl 		= this;
    _ctrl.host=window.location.origin
    _ctrl.signed = '/api/v2018/kronos/participation-requests/'+encodeURIComponent($location.search().q)+'/sign'



$http.post(_ctrl.signed).then(function(u){
  window.location=u.data.signedUrl
  // window.close();
})

	}];
});
