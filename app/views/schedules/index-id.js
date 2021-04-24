import _ from 'lodash'
import moment from 'moment-timezone'
import '~/filters/moment'
import '~/filters/html-sanitizer'
import '~/services/conference-service'

export { default as template } from './index-id.html';

    var CALENDAR_SETTINGS = {
        lastDay: '[Yesterday] - dddd D',
        sameDay: '[Today] - dddd D',
        nextDay: '[Tomorrow] - dddd D',
        nextWeek: 'dddd, D MMMM YYYY',
        lastWeek: 'dddd, D MMMM YYYY',
        sameElse: 'dddd, D MMMM YYYY'
    };

export default ['$scope', '$http', '$route', '$q', 'streamId', 'conferenceService', function($scope, $http, $route, $q, defaultStreamId, conferenceService) {

        var _streamData;

        var _ctrl = $scope.scheduleCtrl =  this;

        _ctrl.now = now;
        _ctrl.CALENDAR = CALENDAR_SETTINGS;

        $scope.$on("refresh",  load);

        load();

		//========================================
		//
		//========================================
        function load() {
            const { all } = $route.current.params

            var streamId = $route.current.params.streamId || defaultStreamId;
            var options  = { params : { cache:true } };
         
            $q.when($route.current.params.code).then(function(code){

                if(!code) return;
            
                return conferenceService.getActiveConference(code);

            }).then(function(conf){

                _ctrl.timezone = conf.timezone;

                if($route.current.params.datetime) // only add if set. avoid cache busting
                    options.params.datetime = now();
                
            }).then(function(){
                const url = all?  `/api/v2016/cctv-streams/${streamId}/all` : 
                                  `/api/v2016/cctv-streams/${streamId}`

                return $http.get(url, options);

            }).then(function(res) {

                _streamData = res.data;

                var venueId = _streamData.eventGroup.venueId;

                return $q.all([
                    $http.get('/api/v2016/types',       { cache : true, params: { q: { schema: 'reservations' }, f: { title: 1, priority: 1, closed: 1, style: 1 }, cache:true } }),
                    $http.get('/api/v2016/venue-rooms', { cache : true, params: { q: { venue : venueId },        f: { title: 1, location: 1, videoUrl:1 }, cache:true } })
                ]);

            }).then(function(res) {

                var types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                var rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});

                _ctrl.timezone = _streamData.eventGroup.timezone;
                _ctrl.event  = _streamData.eventGroup;
                _ctrl.frames = _streamData.frames;
                _ctrl.frames.forEach(function(f){

                    if(!f.reservations)
                        return;

                    f.reservations = _(f.reservations).map(function(r){

                        r.type = types[r.type];
                        r.room = rooms[(r.location||{}).room];
                        r.videoUrl = r.video && (r.videoUrl || r.room.videoUrl)

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
                var timePriority =  moment.tz(r.start, _ctrl.timezone).format("MM:DD:HH:mm");

                return (timePriority + '-' + typePriority + '-' + roomPriority + '-' + (r.title||'')).toLowerCase();
            }
        }

        function now() {

            if(!_ctrl.timezone)
                return;

            if($route.current.params.datetime)
                return now = moment.tz($route.current.params.datetime, _ctrl.timezone).toDate();

            return new Date();
        }
	}];