import _                     from 'lodash'
import moment                from 'moment-timezone'
import ScheduleAgendaDynamicConnectButton from '~/components/meetings/schedule-agenda-dynamic-connect-button.vue'
import ReservationLinks from '~/components/meetings/reservation-links.vue'
import Vue from 'vue'
import 'angular-vue'
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

export default ['$scope', '$http', '$route', '$q', 'streamId', 'conferenceService', '$rootScope', function($scope, $http, $route, $q, defaultStreamId, conferenceService, $rootScope) {
        const _ctrl = $scope.scheduleCtrl =  this;

        Vue.component('ScheduleAgendaDynamicConnectButton', ScheduleAgendaDynamicConnectButton)
        Vue.component('ReservationLinks',ReservationLinks);
        let _streamData;

        _ctrl.CALENDAR    = CALENDAR_SETTINGS;
        _ctrl.now         = now;
        _ctrl.getTimezone = getTimezone;
        _ctrl.expandSection = expandSection;
        _ctrl.expandAllSections = expandAllSections,
        _ctrl.allSectionExpanded= false
        load();

		//========================================
		//
		//========================================
        function load() {

            var streamId = $route.current.params.streamId || defaultStreamId;
            var options  = { params : { cache:true } };
         
            $q.when($route.current.params.code).then(function(code){

                if(!code) return;
            
                return conferenceService.getActiveConference(code);

            }).then(function(conf){
                _ctrl.conferenceTimezone = conf.timezone;
                _ctrl.code               = conf.code
                _ctrl.all                = conf.schedule.all
                _ctrl.showRooms          = conf.schedule.showRooms

                $scope.schedule = conf.schedule

                if($route.current.params.datetime)
                    options.params.datetime = _ctrl.now();
                
            }).then(function(){
                const url = _ctrl.all?  `/api/v2016/cctv-streams/${streamId}/all` : 
                                        `/api/v2016/cctv-streams/${streamId}`

                return $http.get(url, options);

            }).then(function(res) {

                _streamData = res.data;

                var venueId = _streamData.eventGroup.venueId;

                return $q.all([
                    $http.get('/api/v2016/types',       { cache : true, params: { q: { schema: 'reservations' }, f: { title: 1, priority: 1, closed: 1, style: 1 }, cache:true } }),
                    $http.get('/api/v2016/venue-rooms', { cache : true, params: { q: { venue : venueId, 'meta.status': { $nin : ['deleted','archived'] } }, f: { title: 1, location: 1, videoUrl:1 }, cache:true } })
                ]);

            }).then(function(res) {

                var types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                var rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});

                _ctrl.conferenceTimezone = _streamData.eventGroup.timezone;
                _ctrl.event              = _streamData.eventGroup;
                _ctrl.frames             = _streamData.frames;

                const hasRole = isAdmin()

                _ctrl.frames.forEach(function(f, i){

                    if(!f.reservations)
                        return;

                    f.reservations = _(f.reservations).map(function(r){

                        r.type = types[r.type];
                        r.room = rooms[(r.location||{}).room];
                        r.videoUrl = r.video && (r.videoUrl || r.room.videoUrl)

                        if(hasRole) {
                            r.editUrl       = `https://eunomia.cbd.int/schedule/${encodeURIComponent(_ctrl.code)}?day=${encodeURIComponent(r.start)}&edit=${encodeURIComponent(r._id)}`
                            r.adminVideoUrl = r.videoUrl || r.room.videoUrl;
                        }

                        const isDateToday = isToday(r.start);
                        const isDateTomorrow = isTomorrow(r.start);

                        r.groupDateText =  moment(r.start).tz(getTimezone()).format('dddd, MMMM DD');
                        if(isDateToday)
                            r.groupDateText = `Today ${r.groupDateText}`
                        else if(isDateTomorrow)
                            r.groupDateText = `Tomorrow ${r.groupDateText}`

                        return _.defaults(r, { open : !(types[r.type]||{}).closed });

                    }).sortBy(sortKey).value();

                    if(i ==0){
                        expandSection(f.reservations[0], f.reservations)
                    }

                });
            });

            function isAdmin(){
              if(!$rootScope.user) return false

              return _.intersection($rootScope.user.roles, [ 'EunoAdministrator']).length > 0;
            }

            //========================================
            //
            //========================================
            function sortKey(r) {

                if(!r)
                    return "zzz";

                var typePriority =  ((r.type.priority || 999999)+1000000).toString().substr(1);
                var roomPriority =  r.room.title+' ';
                var timePriority =  moment.tz(r.start, getTimezone()).format("MM:DD:HH:mm");

                return (timePriority + '-' + typePriority + '-' + roomPriority + '-' + (r.title||'')).toLowerCase();
            }
        }

        function now() {

            if(!getTimezone())
                  return;

            if($route.current.params.datetime)
                return now = moment.tz($route.current.params.datetime, getTimezone()).toDate();


            return new Date();
        }

        function getTimezone() {
          return  _ctrl.all? localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone : _ctrl.conferenceTimezone 
        }
        _ctrl.getTimezone = getTimezone

        function getMeetingNames(meetings){
          const names = []
          for (const name in meetings) {
            if(meetings[name]) names.push(name)
          }

          return names.join(', ')
        }
        _ctrl.getMeetingNames = getMeetingNames

        function expandSection(groupReservation, reservations){

            groupReservation.expand = !groupReservation.expand

            reservations.filter(e=>e.groupDateText == groupReservation.groupDateText).map(e=>e.expand = groupReservation.expand);
        }

        function expandAllSections(){  
            _ctrl.allSectionExpanded = !_ctrl.allSectionExpanded;

            _.forEach(_ctrl.frames, (frame)=>{
                if(!frame.reservations)
                    return;
                frame.reservations.forEach(r=>{
                    r.expand = _ctrl.allSectionExpanded
                })
            })
            //always keep the first one open
            // _ctrl.frames[0].reservations[0].expand = false;
            // expandSection(_ctrl.frames[0].reservations[0], _ctrl.frames[0].reservations)
        }

        function isToday(testDateTime){

            const test = moment.tz(testDateTime, getTimezone()).startOf('day');
            const now  = moment.tz(new Date(), getTimezone()).startOf('day');
  
            return test.format('X') === now.format('X')
        }

        function isTomorrow(testDateTime){

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate()+1);

            const test = moment.tz(testDateTime, getTimezone()).startOf('day');
            const now  = moment.tz(tomorrow, getTimezone()).startOf('day');
  
            return test.format('X') === now.format('X')
        }
	}];