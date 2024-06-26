import _ from  'lodash'
import '~/filters/lstring'
import '~/filters/moment'
import '~/services/conference-service'
import participationT from '~/i18n/participation/index.js';

export { default as template } from './requests.html'

export default ['$http', '$route', '$location', 'conferenceService', 'user','translationService',  function($http, $route, $location, conferenceService, user, $i18n) {

    var _ctrl = this;

    _ctrl.edit = edit;

    $i18n.set('participationT', participationT);
    
    load();

    //====================================
    //
    //====================================
    function load() {

      _ctrl.loading = true;

      var conferenceCode = $route.current.params.conference;

      conferenceService.getConference(conferenceCode).then(function(conference){

        _ctrl.conference = conference;


        const query = [{
          $match : {
            'meta.createdBy': user.userID,
            $or : [ { 'conference': {$oid: conference._id} }, 
                    { 'conference':        conference._id  } ]
          }
        }, {
          $lookup: {
            from: "kronos-request-organizations",
            localField: "nominatingOrganization",
            foreignField : "_id",
            as : "organizations"
          }
        }]
        
        return $http.get('/api/v2018/kronos/participation-requests', { params: { ag: JSON.stringify(query) } }).then(resData);

      }).then(function(requests){

        _.forEach(requests, function(r) {
          r.organization = r.organizations && r.organizations[0];
        });

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
        segments.push(encodeURIComponent(request.currentStep||'checklist'));
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