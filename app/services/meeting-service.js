define(['app', 'lodash', 'moment-timezone'], function (app, _, moment) {

    app.factory("meetingService", ['$http', '$rootScope', '$q', '$timeout', '$filter', '$route', 
    function ($http, $rootScope, $q, $timeout, $filter, $route) {
        var meeting
            function getActiveMeeting(){

                if(meeting){
                    var defer = $q.defer();
                    defer.resolve(meeting);
                    return defer.promise;
                }
                var query = {};
                if($route.current && $route.current.params && $route.current.params.code){
                    query.code = $route.current.params.code;
                }
                else
                    query.active = true;
                   
                    return $q.when($http.get('/api/v2016/conferences', {params : { q : query, s: { StartDate: 1}}, cache:true}))
                    .then(function(data){
                        meeting             = _.head(data.data);
                        if(meeting){
                            meeting.conference.webcast = _.find(meeting.conference.eventLinks, {type:'webcast'});
                            meeting.conference.media   = _.filter(meeting.conference.eventLinks, {type:'media'});
                            meeting.conference.information   = _.filter(meeting.conference.eventLinks, function(link){return !_.includes(['media', 'webcast'], link.type)});
                           
                            var datetime = moment.tz($route.current.params.datetime || new Date(), meeting.timezone).toDate();
                            if(meeting.schedule && datetime >= new Date(meeting.schedule.start)
                                && new Date() <= new Date(meeting.schedule.end)){
                                    meeting.conference.showSchedule = true;
                            }

                            return meeting;
                        }
                    });
                
            }

            return {
                getActiveMeeting    : getActiveMeeting
            }

    }]);

});
