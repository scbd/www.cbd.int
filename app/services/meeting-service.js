define(['app', 'lodash'], function (app, _) {

    app.factory("meetingService", ['$http', '$rootScope', '$q', '$timeout', '$filter', '$route', 
    function ($http, $rootScope, $q, $timeout, $filter, $route) {
            var meeting;
            function getActiveMeeting(){

                if(meeting){
                    var deferred = $q.defer();
                    $q.resolve(meeting);
                    return deferred.promise;
                }
                if($route.current && $route.current.params && $route.current.params.code){
                   
                    return $q.when($http.get('/api/v2016/conferences', {params : { q : {code:$route.current.params.code }}, cache:true}))
                    .then(function(data){
                        meeting             = _.head(data.data);
                        if(meeting){
                            meeting.conference.webcast = _.find(meeting.conference.eventLinks, {type:'webcast'});
                            meeting.conference.media   = _.filter(meeting.conference.eventLinks, {type:'media'});
                            meeting.conference.information   = _.filter(meeting.conference.eventLinks, function(link){return !_.includes(['media', 'webcast'], link.type)});
                            
                            if(meeting.schedule && new Date() >= new Date(meeting.schedule.start)
                                && new Date() <= new Date(meeting.schedule.end)){
                                    meeting.conference.showSchedule = true;
                            }

                            return meeting;
                        }
                    });
                }
            }

            return {
                getActiveMeeting    : getActiveMeeting
            }

    }]);

});
