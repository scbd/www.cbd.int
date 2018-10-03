define(['lodash', 'app', 'filters/lstring', 'services/conference-service'], function(_) {
 
	return ['$http', '$route', '$location', 'conferenceService', 'user', function($http, $route, $location, conferenceService, user) {

    var _ctrl = this;

    _ctrl.edit = edit;


    load();

    //====================================
    //
    //====================================
    function load() {

      _ctrl.loading = true;

      var conferenceCode = $route.current.params.conference;

      conferenceService.getConference($route.current.params.conference).then(function(conference){

        _ctrl.conference = conference;

        var query = {
          'meta.createdBy': user.userID,
          $or : [ { 'conference': {$oid: conference._id} }, 
                  { 'conference':        conference._id  } ]
        };
        
        return $http.get('/api/v2018/kronos/participation-requests', { params: { q: query } }).then(resData);

      }).then(function(requests){

        _ctrl.requests = requests;


      }).catch(function(error) {

        _ctrl.error = error.data || error;
        console.error(_ctrl.error);

      }).finally(function(){
        delete _ctrl.loading;
      });
    }

    //====================================
    //
    //====================================
    function edit(request) {

      var segments = [
          encodeURIComponent($route.current.params.conference), 
          encodeURIComponent($route.current.params.type)
      ]

      if(request) {
        segments.push(encodeURIComponent(request._id));
        segments.push(encodeURIComponent(request.currentStep));
      }
      else
        segments.push('checklist');
      

      $location.path('/'+segments.join('/'));
    }

    //====================================
    //
    //====================================
    function resData(res) { return res.data; } 

  }];
});
