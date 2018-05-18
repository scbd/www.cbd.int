define(['app', 'lodash', 'moment-timezone'], function (app, _, moment) {

    app.factory("conferenceService", ['$http', '$rootScope', '$q', '$timeout', '$filter', '$route', 
    function ($http, $rootScope, $q, $timeout, $filter, $route) {
            var meeting
            var conferenceArticle;

            function getActiveConference(){

                if(meeting){                    
                    return $q.when(meeting);
                }
                var query = {};
                if($route.current && $route.current.params && $route.current.params.code){
                    query.code = $route.current.params.code;
                }
                else
                    query.active = true;
                   
                return meeting = $q.when($http.get('/api/v2016/conferences', {params : { q : query, s: { StartDate: 1}}, cache:true}))
                                    .then(function(data){
                                        meeting             = _.head(data.data);
                                        if(meeting){
                                            meeting.conference.webcast = _.find(meeting.conference.eventLinks, {type:'webcast'});
                                            meeting.conference.media   = _.filter(meeting.conference.eventLinks, {type:'media'});
                                            meeting.conference.information   = _.filter(meeting.conference.eventLinks, function(link){return !_.includes(['media', 'webcast'], link.type)});
                                            
                                            meeting.conference.sideEventLinks           = _.filter(meeting.conference.scheduleLinks, {type:'side-events'});
                                            meeting.conference.parallelMeetingLinks     = _.filter(meeting.conference.scheduleLinks, {type:'parallel-meeting'});

                                            var datetime = moment.tz($route.current.params.datetime || new Date(), meeting.timezone).toDate();
                                            if(meeting.schedule && new Date(meeting.schedule.start) <= datetime && datetime <= new Date(meeting.schedule.end)){
                                                meeting.conference.showSchedule = true;
                                            }

                                            return meeting;
                                        }
                                    });
                
            }


            function getConferenceArticle(articleId){
                
                if(conferenceArticle){                    
                    return $q.when(conferenceArticle);
                }
                return conferenceArticle =  $q.when($http.get('/api/v2017/articles/' + articleId, {cache:true}))
                                                .then(function(data){
                                                    return article = data.data;
                                                });
                
            }
            return {
                getActiveConference     : getActiveConference,
                getConferenceArticle    : getConferenceArticle
            }

    }]);

});
