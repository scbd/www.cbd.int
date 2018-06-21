define(['app', 'services/conference-service'], function(app) { 'use strict';

	return ['$http','conferenceService','$location', function( $http,conferenceService,$location) {

		var _ctrl 		= this;

		_ctrl.conferenceSelected = conferenceSelected
    _ctrl.goTo               = goTo
    conferenceService.getFuture()
                .then(function(confrences){
                  _ctrl.conferences=confrences
                })

    function conferenceSelected (confrence){
        conferenceService.getMeetings(confrence.MajorEventIDs)
          .then(function(meetings){
            _ctrl.meetings = meetings
          })
    }

    function goTo (type,meeting){
      $location.url('/'+type+'/'+meeting.EVT_CD)
    }

	}];
});
