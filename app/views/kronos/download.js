define(['app'], function() {
 
	return ['$http','$route', '$timeout', function( $http,$route) {

    var _ctrl = this;

    _ctrl.loading=true;

    var resource = $route.current.params.file;
    
    $http.post('/api/v2018/kronos/participation-requests/'+encodeURIComponent(resource)+'/sign').then(function(u){
      
      _ctrl.signedUrl = u.data.url || u.data.signedUrl;
      _ctrl.fileInfo  = u.data;
      
      window.location = u.data.signedUrl;

    }).catch(function(error) {

      _ctrl.error = error.data || error;

    }).finally(function(){
      delete _ctrl.loading;
    });
	}];
});
