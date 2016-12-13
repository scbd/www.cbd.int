define(['lodash', 'moment-timezone', 'angular', 'filters/lstring', 'filters/moment', 'directives/view-injector', 'directives/print-smart/print-smart-checkout', './meeting-document'], function(_, moment, ng) {
    //'css!./agenda.css' // moved to template

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

	return ["$scope", "$route", "$http", '$q', 'eventId', 'streamId', '$interval', function ($scope, $route, $http, $q, eventId, streamId, $interval) {

        var _ctrl = $scope.agendaCtrl = this;

        _ctrl.CALENDAR = CALENDAR_SETTINGS;
        _ctrl.expandAll = expandAll;
        _ctrl.streamId = streamId;
        _ctrl.selectTab = selectTab;
        _ctrl.resolveLiteral = function(value) { return function() { return value; }; };

        var timeTimer    = $interval(updateTime, 30*1000);
        var refreshTimer = $interval(refresh, 10*60*1000);

        $scope.$on("$destroy", function() {
            $interval.cancel(timeTimer);
            $interval.cancel(refreshTimer);
        });

        initAffix();
        load();

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
            if(_ctrl.event)
                _ctrl.now = moment.tz($route.current.params.datetime || new Date(), _ctrl.event.timezone).toDate();

            return _ctrl.now;
        }

        //==============================
        //
        //==============================
        function load() {

            if(!_ctrl.types) {
                _ctrl.types = [{ _id: 'cctv', title: 'Overview' }];
                selectTab(_ctrl.types[0]);
            }

            var reservations, now;
            var event = $http.get('/api/v2016/event-groups/'+eventId, { params: { f : { timezone:1, MajorEventIDs:1, Title: 1, Description:1, venueId:1, schedule:1 } } }).then(function(res) {

                _ctrl.event = event = res.data;

            }).then(function(){

                now = updateTime();

                return loadReservations(now);

            }).then(function(reservations){

                if(reservations.length)
                    return reservations;

                //Lookup for first reservation
                var query  = { 'agenda.items': { $exists: true, $ne: [] }, 'meta.status': { $ne : 'deleted' } };

                return $http.get('/api/v2016/reservations', { params: { q : query, f : { start : 1 }, s: { start : 1 }, fo:1 } }).then(function(res){

                    if(res.data && res.data.start && now.toISOString() < res.data.start)
                        return loadReservations(new Date(res.data.start));

                    return reservations;
                });

            }).then(function(res){

                reservations = res;

                prepopulateTabs(reservations);

                var meetingCodes = _(reservations).map('agenda.items').flatten().map('meeting').uniq().value();

                var meetings = $http.get('/api/v2016/meetings', { params: { q: { EVT_CD: { $in: meetingCodes } }, f : { EVT_TIT_EN:1, EVT_CD:1, print:1 , agenda:1 } } }).then(function(res){
                    return _.forEach(res.data, function(m){
                        m.code  = m.EVT_CD;
                        m.title = m.EVT_TIT_EN;
                    });
                });

                var meetingDocuments = $q.all(_.map(meetingCodes, function(meetingCode) {
                    return $http.get('/api/v2016/meetings/'+meetingCode+'/documents', { params: {  } }).then(function(res){
                        return {
                            meeting : meetingCode,
                            documents : _(res.data).map(function(d) {
                                d.metadata = d.metadata || {};
                                _.defaults(d.metadata, {
                                    printable: ['crp', 'limited', 'non-paper'].indexOf(d.type)>=0
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

                var meetings  = res[0];
                var meetingDocuments = res[1];
                var reservationTypes = res[2];

                reservations.forEach(function(r) {

                    var startOfDay = moment(r.start).tz(event.timezone).startOf('day').toISOString();
                    var startTime  = moment(r.start).tz(event.timezone).format("HH:mm");

                    r.day     = startOfDay;
                    r.dayPart = _(DAY_PARTS).find(function(p) { return startTime < p.end; }).code;

                    r.agenda.items.forEach(function(rItem) {

                        var types;

                        if(rItem.status=='pre-session') types = ['official', 'information'];
                        if(rItem.status=='draft')       types = ['non-paper'];
                        if(rItem.status=='crp')         types = ['crp'];
                        if(rItem.status=='l')           types = ['limited'];

                        var mAgenda        = _(meetings)        .where({ code:     rItem.meeting }).map('agenda').flatten().first();
                        var mItem          = _(mAgenda.items)   .where({ item:     rItem.item    }).first();
                        var mItemDocuments = _(meetingDocuments).where({ meeting : rItem.meeting }).map('documents').flatten().filter(function(d) {
                            return ~(d.agendaItems||[]).indexOf(rItem.item) && (!types || ~types.indexOf(d.type));
                        }).sortBy(function(d){
                            return buildSortKey(d, types);
                        }).value();

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

            }).catch(console.error);
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

            if(!type)
                type = _ctrl.types[0];

            _ctrl.currentTab = type._id;

            type.loaded = true;
        }

        //==============================
        //
        //==============================
        function loadReservations(now) {

            var start = moment(now).toDate(); // from now
            var end   = moment(now).tz(_ctrl.event.timezone).startOf('day').add(2, 'days').toDate(); // to tomorrow

            var fields = { start : 1, end : 1, agenda :1, type: 1, title: 1 };
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

            return $http.get('/api/v2016/reservations', { params: { q : query, f : fields, s: sort } }).then(function(res){
                return res.data;
            });
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

                if(psc.size()) {
                    psc.affix({ offset: { top:psc.offset().top - 10 } });
                    affixReady();
                }
            });
        }
	}];
});
