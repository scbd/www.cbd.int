define(['app', 'lodash', 'moment-timezone', 'filters/moment', 'filters/html-sanitizer'], function(app, _, moment) { "use strict";

    var CALENDAR_SETTINGS = {
        lastDay: '[Yesterday] - dddd D',
        sameDay: '[Today] - dddd D',
        nextDay: '[Tomorrow] - dddd D',
        nextWeek: 'dddd, D MMMM YYYY',
        lastWeek: 'dddd, D MMMM YYYY',
        sameElse: 'dddd, D MMMM YYYY'
    };

	return ['$scope', '$http', '$route', '$q', 'streamId', function($scope, $http, $route, $q, defaultStreamId) {

        var _streamData;

        var _ctrl = $scope.scheduleCtrl =  this;

        _ctrl.CALENDAR = CALENDAR_SETTINGS;

        load();

		//========================================
		//
		//========================================
        function load() {

            var streamId = defaultStreamId || $route.current.params.streamId;
            var options  = { params : { } };
            var now = new Date();

            if($route.current.params.datetime) {
                now = moment($route.current.params.datetime).toDate();
                options.params.datetime = moment($route.current.params.datetime).toDate();
            }

            $http.get('/api/v2016/cctv-streams/'+streamId, options).then(function(res) {

                _streamData = res.data;

                var venueId = _streamData.eventGroup.venueId;

                return $q.all([
                    $http.get('/api/v2016/types',       { cache : true, params: { q: { schema: 'reservations' }, f: { title: 1, priority: 1, closed: 1, style: 1 } } }),
                    $http.get('/api/v2016/venue-rooms', { cache : true, params: { q: { venue : venueId },        f: { title: 1, location: 1 } } })
                ]);

            }).then(function(res) {

                var types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                var rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});

                _ctrl.event  = _streamData.eventGroup;
                _ctrl.frames = _streamData.frames;
                _ctrl.frames.forEach(function(f){

                    if(!f.reservations)
                        return;

                    f.reservations.forEach(function(r){
                        r.type = types[r.type];
                        r.room = rooms[(r.location||{}).room];
                    });

                    f.reservations = _.sortBy(f.reservations, sortKey);

                    _ctrl.now = moment(now).tz(_streamData.eventGroup.timezone);
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
