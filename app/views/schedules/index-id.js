define(['app', 'underscore', 'moment-timezone', 'filters/moment', 'filters/html-sanitizer'], function(app, _, moment) { "use strict";

	return ['$scope', '$http', '$route', '$q', '$interval', function($scope, $http, $route, $q, $interval) {

        var _streamData;

        var _ctrl = this;
        var timer = $interval(load, 60*1000);

        $scope.$on('$destroy', function(){
            console.log('$destroy', timer);
            $interval.cancel(timer);
        });

        load();

		//========================================
		//
		//========================================
        function load() {

            var streamId = $route.current.params.streamId || '6632294138146144';
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
                    $http.get('/api/v2016/types',       { cache : true, params: { q: { schema: 'reservations' } } }),
                    $http.get('/api/v2016/venue-rooms', { cache : true, params: { q: { venue : venueId } } })
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
