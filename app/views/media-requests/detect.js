define(['lodash', 'app', 'filters/lstring', 'services/conference-service'], function(_) {
 
	return ['$scope', '$http', '$route', '$location', 'conferenceService', 'user', function($scope, $http, $route, $location, conferenceService, user) {

    load();

    //====================================
    //
    //====================================
    function load() {

      $scope.loading = true;

      var conferenceCode = $route.current.params.conference;
      var type           = $route.current.params.type;

      conferenceService.getConference(conferenceCode).then(function(conference){

        var query = {
          'meta.createdBy': user.userID,
          $or : [ { 'conference': {$oid: conference._id} }, 
                  { 'conference':        conference._id  } ]
        }

        var fields = { _id:1,  currentStep: 1 };
       
        return $http.get('/api/v2018/kronos/participation-requests', { params: { q: query, l:2, f: fields } }).then(resData);

      }).then(function(requests){

        if(requests.length >1) return $location.path('/'+_.map([conferenceCode, type, 'requests'                              ], encodeURIComponent).join('/'));
        if(requests.length==1) return $location.path('/'+_.map([conferenceCode, type, requests[0]._id, requests[0].currentStep], encodeURIComponent).join('/'));
        
        $location.path('/'+_.map([conferenceCode, type, 'checklist'], encodeURIComponent).join('/'));

      }).catch(function(error) {

        $scope.error = error.data || error;
        console.error($scope.error);

      }).finally(function(){
        delete $scope.loading;
      });
    }

    //====================================
    //
    //====================================
    function resData(res) { return res.data; } 

  }];
});
