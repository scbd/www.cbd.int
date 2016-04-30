define(['app', 'underscore', 'moment-timezone', 'filters/moment', 'filters/html-sanitizer'], function(app, _, moment) { "use strict";

	return ['$http', '$route', '$q', function($http, $route, $q) {

        var _streamData;

        var _ctrl = this;

        load();

		//========================================
		//
		//========================================
        function load() {

            var streamId = $route.current.params.streamId || '6632294138146144';
            var options  = { params : { } };

            if($route.current.params.datetime)
                options.params.datetime = moment($route.current.params.datetime).toDate()

            $http.get('/api/v2016/cctv-streams/'+streamId, options).then(function(res) {

                _streamData = res.data;

                var venueId = _streamData.eventGroup.venueId;

                return $q.all([
                    $http.get('/api/v2016/reservation-types', { cache : true }),
                    $http.get('/api/v2016/venue-rooms',       { cache : true, params: { q: { venue : venueId } } })
                ]);

            }).then(function(res) {

                _ctrl.types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                _ctrl.rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});

                _ctrl.event  = _streamData.eventGroup;
                _ctrl.frames = _streamData.frames;
                _ctrl.frames.forEach(function(f){
                    f.reservations = _.sortBy(f.reservations, sortKey);
                });

            });

            //========================================
            //
            //========================================
            function sortKey(r) {

                if(!r)
                    return "zzz";

                var typePriority = ((_ctrl.types[ r.type              ]||{}).priority || 1000000).toString().substr(1);
                var roomPriority =  (_ctrl.rooms[(r.location||{}).room]||{}).title+' ';//     || 1000000;
                var timePriority = moment.tz(r.start, _ctrl.event.timezone).format("HH:mm");

                return (timePriority + '-' + typePriority + '-' + roomPriority + '-' + (r.title||'')).toLowerCase();
            }

        }
	}];
});
