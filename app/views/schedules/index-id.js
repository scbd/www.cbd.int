import _                     from 'lodash'
import moment                from 'moment-timezone'
import ScheduleAgendaDynamicConnectButton from '~/components/meetings/schedule-agenda-dynamic-connect-button.vue'
import ReservationLinks from '~/components/meetings/reservation-links.vue'
import Vue from 'vue'
import 'angular-vue'
import '~/filters/moment'
import '~/filters/html-sanitizer'
import '~/services/conference-service'
import { Plenary, WorkingGroupI, WorkingGroupII, HighLevelSegment   } from '~/util/meetings-data';
import AgendaItem from '~/components/meetings/sessions/agenda-item.vue'
import ScheduleTime from './schedule-time.vue';

export { default as template } from './index-id.html';

    var CALENDAR_SETTINGS = {
        lastDay: '[Yesterday] - dddd D',
        sameDay: '[Today] - dddd D',
        nextDay: '[Tomorrow] - dddd D',
        nextWeek: 'dddd, D MMMM YYYY',
        lastWeek: 'dddd, D MMMM YYYY',
        sameElse: 'dddd, D MMMM YYYY'
    };

export default ['$scope', '$http', '$route', '$q', 'streamId', 'conferenceService', '$rootScope', '$location', '$timeout',
    function($scope, $http, $route, $q, defaultStreamId, conferenceService, $rootScope, $location, $timeout) {
        const _ctrl = $scope.scheduleCtrl =  this;
        var sinceLastReload = new moment();
        Vue.component('ScheduleAgendaDynamicConnectButton', ScheduleAgendaDynamicConnectButton)
        Vue.component('ReservationLinks',ReservationLinks);

        let _streamData;

        _ctrl.CALENDAR    = CALENDAR_SETTINGS;
        _ctrl.now         = now;
        _ctrl.getTimezone = getTimezone;
        _ctrl.expandSection = expandSection;
        _ctrl.expandAllSections = expandAllSections,
        _ctrl.allSectionExpanded= false

        $scope.route      = { params : $route.current.params, query: $location.search() }
        $scope.vueOptions  = { components: { AgendaItem, ScheduleTime } };

        load();

		//========================================
		//
		//========================================
        function load() {

            const expandedReservationIds = _(_ctrl.frames).map(f=>f.reservations||[]).flatten().filter(r=>r.expand).map(r=>r._id).value();

            var streamId = $route.current.params.streamId || defaultStreamId;
            var options  = { params : { cache:true } };
         
            return $q.when($route.current.params.code).then(function(code){

                if(!code) return;
            
                return conferenceService.getActiveConference(code);

            }).then(async function(conf){
                _ctrl.institution        = conf.institution;
                _ctrl.conferenceTimezone = conf.timezone;
                _ctrl.code               = conf.code
                _ctrl.all                = conf.schedule.all
                _ctrl.showRooms          = conf.schedule.showRooms
                _ctrl.uploadStatement    = conf.uploadStatement;

                $scope.schedule = conf.schedule
                $scope.timezone = conf.timezone

                if($route.current.params.datetime)
                    options.params.datetime = _ctrl.now();
                
                if(_ctrl.uploadStatement) {
                    const uploadStatementButton = await import('~/components/meetings/upload-statement-button.vue')
                    Vue.component('uploadStatementButton', uploadStatementButton.default);
                }
                
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

            })
            .then(function(res){

                var meetingCodes = _(_streamData.frames).map('reservations').flatten().map('agenda.items').flatten().map('meeting').uniq().value();

                var meetings = $http.get('/api/v2016/meetings', { params: { q: { EVT_CD: { $in: meetingCodes } }, f : { EVT_TIT_EN:1, EVT_CD:1, printSmart:1 , agenda:1, uploadStatement:1 }, cache: true } })
                                
                return meetings.then(function(m){
                    return [...res, m];
                });
            }).then(function(res) {

                var types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                var rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                const meetings = res[2].data

                _ctrl.conferenceTimezone = _streamData.eventGroup.timezone;
                _ctrl.event              = _streamData.eventGroup;
                _ctrl.frames             = _streamData.frames;
                _ctrl.timezone           = _streamData.eventGroup.timezone;

                const hasRole = isAdmin()
                const statementEnabledMeetings = meetings.filter(m=>m.uploadStatement).map(m=>m.EVT_CD);
                
                _ctrl.frames.forEach(function(f, i){

                    if(!f.reservations)
                        return;

                    f.reservations = _(f.reservations||[]).map(function(r){

                        r.type = types[r.type];
                        r.room = rooms[(r.location||{}).room];
                        r.videoUrl = r.video && (r.videoUrl || r.room.videoUrl)

                        if(hasRole) {
                            r.editUrl       = `https://eunomia.cbd.int/${encodeURIComponent(_ctrl.institution)}/${encodeURIComponent(_ctrl.code)}/schedule?day=${encodeURIComponent(r.start)}&edit=${encodeURIComponent(r._id)}`
                            r.adminVideoUrl = r?.videoUrl || r?.room?.videoUrl;
                        }

                        const isDateToday = isToday(r.start);
                        const isDateTomorrow = isTomorrow(r.start);

                        r.groupDateText =  moment(r.start).tz(getTimezone()).format('dddd, MMMM DD');
                        if(isDateToday)
                            r.groupDateText = `${r.groupDateText} (Today)`
                        else if(isDateTomorrow)
                            r.groupDateText = `${r.groupDateText} (Tomorrow)`;
                        
                        const allowedTypeForStatementsIds = [ Plenary, WorkingGroupI, WorkingGroupII, HighLevelSegment ];
                        if(allowedTypeForStatementsIds.includes(r.type._id) && 
                            r.agenda?.meetings && r.agenda?.items?.length){ 

                            const group = _(r.agenda.items)
                                            .filter(e=>{
                                                return statementEnabledMeetings.includes(e.meeting)
                                            })
                                            .groupBy('meeting').value();   
                                            
                            if(Object.keys(group).length){
                                r.uploadStatementFilter =  {};
                                _.each(group, (items, key)=>{
                                    r.uploadStatementFilter[key] = items.map(i=>i.item);
                                })

                            }
                        }
                        
                        r.agenda?.items?.forEach(function(rItem) {

                            var mAgenda        = _(meetings)     .where({ EVT_CD:     rItem.meeting }).map('agenda').flatten().first();
                            var mItem          = _(mAgenda?.items).where({ item:     rItem.item    }).first();

                            rItem.code      = mItem?.code;
                        
                        });

                        r.expand = expandedReservationIds?.find(er=>er?._id == r._id && er?.expand)

                        return _.defaults(r, { open : !(types[r.type]||{}).closed });

                    }).sortBy(sortKey).value();
                    
                });
                refreshPage();


                const allRes = _(_ctrl.frames).map(f=>f.reservations||[]).flatten().sortBy(sortKey).value();

                expandedReservationIds.forEach(id=>expandSection(id, true));

                const isAnyExpanded = allRes.some(o=>o.expand);

                if(!isAnyExpanded && allRes.length)
                    expandSection(allRes[0]._id, true);
            });
        }

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

            var typePriority =  `${r?.type?.priority || 999999}`.padStart(6, '0');
            var timePriority =  moment.tz(r.start, getTimezone()).toISOString();
            var roomPriority =  r?.room?.title || '';
            var titlePriority=  r?.title || '';

            return `${timePriority}-${typePriority}-${roomPriority}-${titlePriority}`.toLowerCase();
        }

        function now() {

            if(!getTimezone())
                  return;

            if($route.current.params.datetime)
                return now = moment.tz($route.current.params.datetime, getTimezone()).toDate();


            return new Date();
        }

        function getTimezone() {
          return  _ctrl.conferenceTimezone 
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

        function expandSection(id, expanded){

            const reservations = _(_ctrl.frames).map(f=>f.reservations||[]).flatten().sortBy(sortKey).value();
            const reservation  = reservations.find(r=>r._id==id);

            if(!reservation) return;

            expanded = expanded===undefined ? !reservation.expand : !!expanded;

            const { groupDateText } = reservation;

            reservations.filter(r=>r.groupDateText == groupDateText).forEach(r=>r.expand = expanded);

            _ctrl.allSectionExpanded = reservations.every(r=>!!r.expand);
        }

        function expandAllSections(expanded){  

            const reservations = _(_ctrl.frames).map(f=>f.reservations||[]).flatten().value();

            if(expanded===undefined) {
                const isAllExpanded = reservations.every(r=>!!r.expand);
                expanded = !isAllExpanded;
            }

            reservations.forEach(r=> r.expand = expanded);

            _ctrl.allSectionExpanded = reservations.every(r=>!!r.expand);
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

        function refreshPage(){
            $timeout(function(){
                if(moment().diff(sinceLastReload, 'hours') > 1){
                    window.location.reload();
                    return;
                }
                load();
            }, 5*60*1000)
        }

	}];