define(['app', 'lodash', 'moment-timezone', 'angular-cache'], function (app, _, moment) {

    app.factory("conferenceService", ['$http', '$rootScope', '$q', '$timeout', '$filter', '$route', 'CacheFactory',
    function ($http, $rootScope, $q, $timeout, $filter, $route, CacheFactory) {
            var meeting
            var httpCache = CacheFactory.get('conferenceHttpCache');
            if (!httpCache) {
                httpCache = CacheFactory.createCache('conferenceHttpCache', {
                    deleteOnExpire: 'aggressive',
                    recycleFreq   : 10000,
                    maxAge        : 5 * 60 * 1000,
                    storageMode   : 'memory',
                    storagePrefix : 'httpCache_'
                });
            }
            function getActiveConference(code){

                if(meeting){
                    return $q.when(meeting);
                }
                var query = {};
                if(code)
                    query.code = code;
                else if($route.current && $route.current.params && $route.current.params.code){
                    query.code = $route.current.params.code;
                }
                else
                    query.active = true;

                return meeting = $q.when($http.get('/api/v2016/conferences', {params : { q : query, s: { StartDate: 1}, cache: true }, cache:httpCache}))
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
            function getFuture(){
              var query = {
                            EndDate:{ $gt: { $date: new Date()  } },
                            institution:"CBD"
                          }
              return $http.get('/api/v2016/conferences', {params : { q : query, f:{ StartDate:1,MajorEventIDs:1,Title:1,Venua:1,code:1,Description:1}, s: { StartDate: 1}, cache: true}, cache:httpCache}).then(
                function(res){

                  return res.data
                }
              )
            }
            function getConference(codeOrId){
              var isOID = RegExp(/^[0-9a-fA-F]{24}$/)
              var query = {}
              if(isOID.test(codeOrId))
                query._id = {'$oid':codeOrId}
              else
                query.code = codeOrId

              return $http.get('/api/v2016/conferences', {params : { q : query, f:{ StartDate:1,MajorEventIDs:1,Title:1,Venue:1,code:1,Description:1, venueId:1, schedule:1, timezone:1 }, s: { StartDate: 1}, fo: 1, cache: true }, cache:httpCache}).then(
                function(res){

                  return res.data
                }
              )
            }
            function getMeetings(ids){
              var oidArray=[];

              for (var i=0; i<ids.length; i++) {
                oidArray.push({
                    '$oid': ids[i]
                });
              }
              var query = {
                            _id:{$in:oidArray}
                          }
              return  $http.get('/api/v2016/meetings', { cache:httpCache, params: { q : query,f : { EVT_CD:1, title:1, venueText:1, dateText:1, EVT_WEB:1, EVT_INFO_PART_URL:1, EVT_REG_NOW_YN:1, EVT_STY_CD:1 }, cache: true  } })
              .then(function(res){
                  return res.data
                }
              )
            }

            return {
                getMeetings             : getMeetings,
                getFuture               : getFuture,
                getConference           : getConference,
                getActiveConference     : getActiveConference
            }

    }]);

});
