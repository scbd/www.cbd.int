define(['app', 'lodash', 'moment-timezone', 'filters/moment', 'filters/html-sanitizer', 'services/conference-service'], function(app, _, moment) { "use strict";

    var CALENDAR_SETTINGS = {
        lastDay: '[Yesterday] - dddd D',
        sameDay: '[Today] - dddd D',
        nextDay: '[Tomorrow] - dddd D',
        nextWeek: 'dddd, D MMMM YYYY',
        lastWeek: 'dddd, D MMMM YYYY',
        sameElse: 'dddd, D MMMM YYYY'
    };

	return ['$scope', '$http', '$route', '$q', 'streamId', 'conferenceService','$rootScope','$timeout','$window', function($scope, $http, $route, $q, defaultStreamId, conferenceService,$rootScope,$timeout,$window) {

        var _streamData;
        var postSent = false
        var _ctrl = $scope.scheduleCtrl =  this;

        _ctrl.CALENDAR = CALENDAR_SETTINGS;
        _ctrl.finished = finished;
        $scope.$on("refresh",  load);

        load();

        //==============================
        //
        //==============================
        function finished() {
            if(!$rootScope.viewOnly || postSent) return
            
            $timeout(function(){
              $window.parent.postMessage({type:'loadingFinished',data:true},'*');
              postSent = true
            },300)
        }
        
		//========================================
		//
		//========================================
        function load() {

            var streamId = $route.current.params.streamId || defaultStreamId;
            var options  = { params : { } };
            var now = new Date();

            if($route.current.params.datetime) {
                now = moment.tz($route.current.params.datetime).toDate();
                options.params.datetime = moment.tz($route.current.params.datetime).toDate();
            }

            $q.when($route.current.params.code).then(function(code){

                if(!code) return;
            
                return conferenceService.getActiveConference(code).then(function(e){

                    now = moment.tz($route.current.params.datetime, e.timezone).toDate();
                    options.params.datetime = moment.tz($route.current.params.datetime, e.timezone).toDate();
                })

            }).then(function(){
                
                return $http.get('/api/v2016/cctv-streams/'+streamId, options);

            }).then(function(res) {

                _streamData = res.data;

                var venueId = _streamData.eventGroup.venueId;

                return $q.all([
                    $http.get('/api/v2016/types',       { cache : true, params: { q: { schema: 'reservations' }, f: { title: 1, priority: 1, closed: 1, style: 1 } } }),
                    $http.get('/api/v2016/venue-rooms', { cache : true, params: { q: { venue : venueId },        f: { title: 1, location: 1 } } })
                ]);

            }).then(function(res) {

                var types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                var rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});

                _ctrl.now    = moment(now).tz(_streamData.eventGroup.timezone);
                _ctrl.event  = _streamData.eventGroup;
                _ctrl.frames = _streamData.frames;
                _ctrl.frames.forEach(function(f){

                    if(!f.reservations)
                        return;

                    f.reservations = _(f.reservations).map(function(r){

                        r.type = types[r.type];
                        r.room = rooms[(r.location||{}).room];

                        return _.defaults(r, { open : !(types[r.type]||{}).closed });

                    }).sortBy(sortKey).value();
                });
            });

            //========================================
            //
            //========================================
            function sortKey(r) {

                if(!r)
                    return "zzz";

                var typePriority =  ((r.type.priority || 999999)+1000000).toString().substr(1);
                var roomPriority =  r.room.title+' ';
                var timePriority =  moment.tz(r.start, _ctrl.event.timezone).format("HH:mm");

                return (timePriority + '-' + typePriority + '-' + roomPriority + '-' + (r.title||'')).toLowerCase();
            }


        }
	}];
});
