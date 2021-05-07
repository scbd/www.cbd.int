import '~/filters/lstring'
import '~/filters/moment'
import '~/filters/temp-title-filter'
import '~/directives/view-injector'
import '~/directives/print-smart/print-smart-checkout'
import './meeting-document'
import '~/services/conference-service'
import '~/directives/meetings/time-zone-feature-alert'
import 'css!./agenda.css' 
import _ from 'lodash'
import moment from 'moment-timezone'
import ng from 'angular'

export { default as template } from './agenda.html'

    var CALENDAR_SETTINGS = {
        lastDay: '[Yesterday] - dddd D',
        sameDay: '[Today] - dddd D',
        nextDay: '[Tomorrow] - dddd D',
        nextWeek: 'dddd, D MMMM YYYY',
        lastWeek: 'dddd, D MMMM YYYY',
        sameElse: 'dddd, D MMMM YYYY'
    };


    var DAY_PARTS = [
        { code: 'morning',   end : '13:00'},
        { code: 'afternoon', end : '18:00'},
        { code: 'evening',   end : '24:00'}
    ];

export default ["$scope", "$route", "$http", '$q', '$interval', 'conferenceService', '$location', '$timeout', '$rootScope',
    function ($scope, $route, $http, $q, $interval, conferenceService, $location, $timeout, $rootScope) {

        var eventId;
        var streamId;
        var timeTimer;
        var refreshTimer;

        var _ctrl = $scope.agendaCtrl = this;

        _ctrl.CALENDAR  = CALENDAR_SETTINGS;
        _ctrl.expandAll = expandAll;
        _ctrl.selectTab = selectTab;
        _ctrl.hasTab    = hasTab;
        _ctrl.resolveLiteral = function(value) { return function() { return value; }; };
        _ctrl.scheduleDateChanged = scheduleDateChanged;
        _ctrl.deviceSize          = $rootScope.deviceSize;
        
        $q.when(conferenceService.getActiveConference())
        .then(function(meeting){
            _ctrl.all            = meeting.schedule.all
            _ctrl.connectionInit = meeting.schedule.connection.initTimes
            eventId              = meeting._id;
            streamId             = meeting.conference.streamId;
            _ctrl.streamId       = streamId;
            _ctrl.meeting        = meeting;
            
            load();
            timeTimer    = $interval(updateTime, 30*1000);
            refreshTimer = $interval(refresh, 10*60*1000);
        })

        $scope.$on("$destroy", function() {
            $interval.cancel(timeTimer);
            $interval.cancel(refreshTimer);
        });

        initAffix();

        //==============================
        //
        //==============================
        function refresh() {
            $scope.$broadcast("refresh");
            load();
        }

        //==============================
        //
        //==============================
        function updateTime() {
            if(_ctrl.event){              
                // BF not sure why we use $route.current.params.datetime instead of $location for reading qs
                _ctrl.now = moment.tz($location.search().datetime || $route.current.params.datetime || new Date() , getTimezone()).toDate();
            }
            return _ctrl.now;
        }

        //==============================
        //
        //==============================
        function load() {

            if(!eventId)
                return;

            if(!_ctrl.types) {
                _ctrl.types = [{ _id: 'cctv', title: 'Overview' }];
                selectTab(_ctrl.types[0]);
            }

            var reservations, now;
            var event = conferenceService.getConference(eventId).then(function(conf) {

                _ctrl.event = event = conf;
                _ctrl.conferenceTimezone = event.timezone
                processScheduleDates();               
                return conferenceService.getAgendas(conf.MajorEventIDs)
            }).then(function(agendas){
                const colorMap = {}

                for (const { EVT_CD:code, agenda } of agendas)
                  colorMap[code] = agenda.color
                
                _ctrl.colorMap = colorMap
            }).then(function(){

                now = updateTime();

                return loadReservations(now);

            }).then(function(reservations){

                if(reservations.length)
                    return reservations;
                
                //Lookup for first reservation
                var query  = { 'agenda.items': { $exists: true, $ne: [] }, 'meta.status': { $ne : 'deleted' } };

                return $http.get('/api/v2016/reservations', { params: { q : query, f : { start : 1 }, s: { start : 1 }, fo:1, cache: true } }).then(function(res){

                    if(res.data && res.data.start && now.toISOString() < res.data.start)
                        return loadReservations(new Date(res.data.start));

                    return reservations;
                });

            }).then(function(res){
                
                reservations = res;

                prepopulateTabs(reservations);

                var meetingCodes = _(reservations).map('agenda.items').flatten().map('meeting').uniq().value();

                var meetings = $http.get('/api/v2016/meetings', { params: { q: { EVT_CD: { $in: meetingCodes } }, f : { EVT_TIT_EN:1, EVT_CD:1, printSmart:1 , agenda:1 }, cache: true } }).then(function(res){
                    return _ctrl.meetings  = _.forEach(res.data, function(m){
                        m.code  = m.EVT_CD;
                        m.title = m.EVT_TIT_EN;
                    });
                });

                var meetingDocuments = $q.all(_.map(meetingCodes, function(meetingCode) {
                    return $http.get('/api/v2016/meetings/'+meetingCode+'/documents', { params: { cache:true } }).then(function(res){
                        return {
                            meeting : meetingCode,
                            documents : _(res.data).map(function(d) {
                                d.metadata = d.metadata || {};

                                _.defaults(d.metadata, {
                                    printable: ['crp', 'limited', 'non-paper'].indexOf(d.nature)>=0
                                });

                                return d;
                            }).value()
                        };
                    });
                }));

                var resQuery = {
                    schema:'reservations',
                    _id : {
                        $in : _(reservations).map('type').uniq().map(function(id) { return { $oid:id }; }).value()
                    }
                };

                var reservationTypes = $http.get('/api/v2016/types', { params: { q: resQuery, f: { title:1 }, s:{priority:1, title:1} }, cache:true }).then(function(res){
                    return res.data;
                });

                return $q.all([meetings, meetingDocuments, reservationTypes]);

            }).then(function(res){

                var meetings         = res[0];
                var meetingDocuments = res[1];
                var reservationTypes = res[2];

                reservations.forEach(function(r) {

                    var startOfDay = moment(r.start).tz(getTimezone()).startOf('day').toISOString();
                    var startTime  = moment(r.start).tz(getTimezone()).format("HH:mm");

                    r.day     = startOfDay;
                    r.dayPart = _(DAY_PARTS).find(function(p) { return startTime < p.end; }).code;

                    r.agenda.items.forEach(function(rItem) {

                        var types;

                        if(rItem.status=='pre-session') types = ['official/', 'information/'];
                        if(rItem.status=='draft')       types = ['in-session/non-paper'];
                        if(rItem.status=='crp')         types = ['in-session/crp'];
                        if(rItem.status=='l')           types = ['in-session/limited'];

                        var mAgenda        = _(meetings)        .where({ code:     rItem.meeting }).map('agenda').flatten().first();
                        var mItem          = _(mAgenda.items)   .where({ item:     rItem.item    }).first();
                        var mItemDocuments;

                        if(rItem.files && rItem.files.length) {

                            var docsById = _(meetingDocuments).map('documents').flatten().reduce(function(ret, d) {
                                ret[d._id] = d;
                                return ret;
                            }, {});

                            mItemDocuments = _(rItem.files).map(function(f) {
                                return docsById[f._id];
                            }).compact().value();

                        }
                        else {

                            mItemDocuments = _(meetingDocuments).where({ meeting : rItem.meeting }).map('documents').flatten().filter(function(d) {
                                return ~(d.agendaItems||[]).indexOf(rItem.item) && (!types || ~types.indexOf(d.type+'/'+(d.nature||'')));
                            }).sortBy(function(d){
                                return buildSortKey(d, types);
                            }).value();
                        }

                        rItem.color     = (mAgenda||{}).color;
                        rItem.prefix    = (mAgenda||{}).prefix;
                        rItem.title     = (mItem||{}).title;
                        rItem.shortTitle= (mItem||{}).shortTitle;
                        rItem.scopes    = (mItem||{}).scopes;
                        rItem.documents = mItemDocuments; //todo
                        rItem.status    = rItem.status||undefined;
                    });

                    r.agenda.showStatus = !!_(r.agenda.items).map('status').compact().uniq().size();
                });

                _ctrl.documents = _(meetingDocuments).map('documents').flatten().value();

                _ctrl.types.length=1;

                _ctrl.types = _ctrl.types.concat(_(reservationTypes).forEach(function(type) {

                    type.days = _(reservations).where({ type: type._id }).reduce(function(days, res) {

                        days[res.day]              = days[res.day]              || {};
                        days[res.day][res.dayPart] = days[res.day][res.dayPart] || [];
                        days[res.day][res.dayPart].push(res);

                        return days;
                    }, {});
                }).value());

                selectTab(_.findWhere(_ctrl.types, { _id: _ctrl.currentTab}));

            }).catch(console.error).finally(function() { _ctrl.loaded=true;});
        }

        //==============================
        //
        //==============================
        function prepopulateTabs(res) {
            _ctrl.types.length=1;
            if(_(res).some({type:'570fd1ac2e3fa5cfa61d90f5'})) _ctrl.types.push({_id:'570fd1ac2e3fa5cfa61d90f5', title:"Plenary" });
            if(_(res).some({type:'58379a233456cf0001550cac'})) _ctrl.types.push({_id:'58379a233456cf0001550cac', title:"Working Group I"  });
            if(_(res).some({type:'58379a293456cf0001550cad'})) _ctrl.types.push({_id:'58379a293456cf0001550cad', title:"Working Group II" });
        }

        //==============================
        //
        //==============================
        function selectTab(type) {
            if(_.isString(type))
                type = _.findWhere(_ctrl.types, { _id: type});

            if(!type)
                type = _ctrl.types[0];

            _ctrl.currentTab = type._id;

            type.loaded = true;

            $timeout(() => $('[data-toggle="tooltip"]').tooltip(),250);
        }

        //========================================
        //
        //========================================
        function hasTab(tab) {
            return !!_.findWhere(_ctrl.types, { _id: tab});
        }

        //==============================
        //
        //==============================
        function loadReservations(now) {

            const { schedule } = _ctrl.event
            const   tomorrow   = moment(now).tz(getTimezone()).startOf('day').add(2, 'days').toDate();
            const   eventEnd   = moment(schedule.end).tz(getTimezone()).startOf('day').add(2, 'days').toDate();
            const   start      = moment(now).startOf('minute').toDate(); // start of minute to avois cache busting
            const   end        = _ctrl.all?  eventEnd : tomorrow// to tomorrow

            var fields = { start : 1, end : 1, agenda :1, type: 1, title: 1, video:1, videoUrl:1,location: 1 };
            var sort   = { start : 1, end : 1 };
            var query  = {
                'agenda.items': { $exists: true, $ne: [] },
                'meta.status': { $ne : 'deleted' },
                start : { $lte: { $date: end   } },
                end   : { $gte: { $date: start } },
                $or : [
                    { confirmed : { $exists: false } },
                    { confirmed : true }
                ]
            };

            var rooms = loadRooms();
            var reservations = $http.get('/api/v2016/reservations', { params: { q : query, f : fields, s: sort, cache: true } }).then(resData);
            
            return $q.all([reservations, rooms]).then(function(res){

                reservations = res[0];
                rooms        = res[1];
                
                return _.map(reservations, function(r){
                    
                    r.room     = rooms[(r.location||{}).room];
                    r.videoUrl = r.video && (r.videoUrl || r.room.videoUrl);

                    return r;
                })
            });
        }

        //==============================
        //
        //==============================
        var rooms;
        function loadRooms() {

            return rooms || $http.get('/api/v2016/venue-rooms', { cache : true, params: { q: { venue : _ctrl.event.venueId },        f: { title: 1, location: 1, videoUrl:1 }, cache:true } }).then(function(res){
                
                return _.reduce(res.data, function(ret, r){ 
                    ret[r._id] = r; 
                    return ret; 
                }, {});
            })
        }

        //==============================
        //
        //==============================
        function buildSortKey(d, types) {

            var typePos;

            if(types && ~types.indexOf(d.type)) {
                typePos = types.indexOf(d.type);
            }
            else if(d.type=="report")      typePos = 10;
            else if(d.type=="outcome")     typePos = 20;
            else if(d.type=="limited")     typePos = 30;
            else if(d.type=="crp")         typePos = 40;
            else if(d.type=="non-paper")   typePos = 50;
            else if(d.type=="official")    typePos = 60;
            else if(d.type=="information") typePos = 70;
            else if(d.type=="other")       typePos = 80;
            else if(d.type=="statement")   typePos = 90;

            return ("000000000" + (typePos   ||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   ((d.metadata||{}).superseded ? '1' : '0') + '_' +
                   ("000000000" + (d.position||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   (d.symbol||"").replace(/\b(\d)\b/g, '0$1')
                                 .replace(/(\/REV)/gi, '0$1')
                                 .replace(/(\/ADD)/gi, '1$1');
        }

        //==============================
        //
        //==============================
        function expandAll(reservations) {

            _(reservations).map('agenda').map('items').flatten().forEach(function(agendaItem) {
                agendaItem.expanded = true;
            }).value();
        }

        //==============================
        //
        //==============================
        function initAffix() {

            var affixReady = $scope.$watch(function() {

                var psc = ng.element('#print-smart-checkout');
                //TODO fix affix issue
                if(psc.length) {
                    // psc.affix({ offset: { top:psc.offset().top - 10 } });
                    affixReady();
                }
            });
        }

        function processScheduleDates(){
            const { schedule } = _ctrl.event;

            if(!schedule.start) return;

            var start = moment.tz(schedule.start, getTimezone());
            var end;
            var now = moment.tz(new Date(), getTimezone());

            if(schedule.end)
                end = moment.tz(schedule.end, getTimezone());
            else
                end = moment.tz(schedule.start, getTimezone()).add(30, 'd')


            if($route.current.params.datetime)
                _ctrl.scheduleDate =  moment.tz($route.current.params.datetime, getTimezone()).format('YYYY-MM-DD');
            else if(now > end){
                _ctrl.scheduleDate =  moment.tz(end, getTimezone()).format('YYYY-MM-DD');
                 //update querystring so that schedule directive can load appropriate date/ this if for plain shedule url where the date 
                 //is not specidied the default to end date
                 $location.search({datetime:moment.tz(end, _ctrl.event.timezone).format('YYYY-MM-DD')});
            }
            if(!_ctrl.all && end > now){
                end = now;
            }

            updateTime(); //update time in now to reflect the UI
            var difference = end.diff(start, 'days')+1;
            var dates = []
            for(var i=0; i < difference; i++){
                var date = moment.tz(schedule.start, getTimezone()).add(i, 'd');
                var dateOption = {
                    value : date.format('YYYY-MM-DD')
                }
                dates.push(dateOption)
            }

            if(end == now){
                var date = moment.tz(new Date(), getTimezone()).add(i, 'd');
                var dateOption = {
                    value : '',
                    text : 'Now'
                }
                dates.push(dateOption)
            }

            _ctrl.scheduleDate  = _ctrl.scheduleDate || "";
            _ctrl.scheduleDates = dates;
        };

        function scheduleDateChanged(date){ 
            _ctrl.scheduleDate = date;
            var tab = _ctrl.currentTab;     
            _ctrl.types[0].loaded = false;
            _ctrl.currentTab = undefined;

            $location.search({ datetime: _ctrl.scheduleDate||undefined });

            load();
            _ctrl.currentTab = tab;
        }

        function resData(res) {
            return res.data;
        }

        function getTimezone() {
          if(!_ctrl.all) return _ctrl.conferenceTimezone


          return  localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone
        }
        _ctrl.getTimezone = getTimezone

        function getTimezones() {
          const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

          if(_ctrl.conferenceTimezone === browserTimezone) {
            if(localStorage.getItem('timezone') !== _ctrl.conferenceTimezone){
              localStorage.setItem('timezone', _ctrl.conferenceTimezone)
              load()
            }
            return [] 
          }

          if(getTimezone() === _ctrl.conferenceTimezone) return [browserTimezone]

          return [_ctrl.conferenceTimezone]
        }
        _ctrl.getTimezones = getTimezones

        function timezoneChanged(zone) {
          const tz         = localStorage.getItem('timezone')
          const selectedTz = zone || tz || Intl.DateTimeFormat().resolvedOptions().timeZone

          localStorage.setItem('timezone', selectedTz )

          load()
        }
        _ctrl.timezoneChanged = timezoneChanged

        function getColor(code) {
          return  _ctrl.colorMap[code]
        }
        _ctrl.getColor = getColor

        function getReservationTypeName(code) {
          return  (_ctrl.types.find(({ _id }) => code === _id)).title
        }
        _ctrl.getReservationTypeName = getReservationTypeName

        function canConnect({ type, start }) {
          const now            = moment.tz(new Date(), getTimezone()).toDate();
          const minutes        = minutesBefore({ type })
          const canConnectTime = moment(start).subtract(minutes, 'm').toDate();

          return now >= canConnectTime
        }
        _ctrl.canConnect = canConnect

        function minutesBefore({ type }) {
          const isTypeString   = typeof type === 'string'
          const types          = Object.keys(_ctrl.connectionInit)
          const typeIdentifier = isTypeString? type : type._id
          const isInTypes      = types.includes(typeIdentifier)
          
          return isInTypes? _ctrl.connectionInit[typeIdentifier] : _ctrl.connectionInit.default
        }
        _ctrl.minutesBefore = minutesBefore

        function isInProgress({ start, end }) {
          const now       = moment.tz(new Date(), getTimezone()).toDate();
          const startDate = moment.tz(start, getTimezone()).toDate();
          const endDate   = moment.tz(end, getTimezone()).toDate();

          return startDate <= now  && now  <= endDate
        }
        _ctrl.isInProgress = isInProgress

        function isConnectionDone({ end }) {
          const { closeAccessDelayTime }  = _ctrl.event?.schedule?.connection

          const   now                    = moment.tz(new Date(), getTimezone()).toDate();
          const   endDate                = moment.tz(end, getTimezone()).add(closeAccessDelayTime || 15, 'minutes').toDate();

          return now > endDate
        }
        _ctrl.isConnectionDone = isConnectionDone
	}];