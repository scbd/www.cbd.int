define(['lodash', 'moment-timezone', 'filters/lstring', 'filters/moment', 'directives/print-smart/print-smart-checkout', './meeting-document'], function(_, moment) {
    //'css!./agenda.css' // moved to template

    var CALENDAR_SETTINGS = {
        lastDay: '[Yesterday] - dddd D',
        sameDay: '[Today] - dddd D',
        nextDay: '[Tomorrow] - dddd D',
        sameElse: 'dddd D, MMMM YYYY'
    };

    var DAY_PARTS = [
        { code: 'morning',   end : '13:00'},
        { code: 'afternoon', end : '18:00'},
        { code: 'evening',   end : '24:00'}
    ];

	return ["$scope", "$route", "$http", '$q', function ($scope, $route, $http, $q) {

        var eventGroupId = '56f14b1e49a977d560a27ede'; // from route;
        var _ctrl = this;

        _ctrl.CALENDAR = CALENDAR_SETTINGS;
        _ctrl.expandAll = expandAll;

        load();

        //==============================
        //
        //==============================
        function load() {

            var reservations;
            var eventGroup = $http.get('/api/v2016/event-groups/'+eventGroupId, { params: { f : { timezone:1, MajorEventIDs:1, Title: 1, Description:1, venueId:1, schedule:1 } } }).then(function(res) {

                _ctrl.eventGroup = eventGroup = res.data;

            }).then(function(){

                var now = _ctrl.now = moment.tz($route.current.params.datetime || new Date(), eventGroup.timezone).toDate();

                var start = moment(now).toDate(); // from now
                var end   = moment(now).tz(eventGroup.timezone).startOf('day').add(2, 'days').toDate(); // to tomorrow

                var fields = { start : 1, end : 1, agenda :1, type: 1, title: 1 };
                var sort   = { start : 1, end : 1 };
                var query  = {
                    'agenda.items': { $exists: true, $ne: [] },
                    start : { $lte: { $date: end   } },
                    end   : { $gte: { $date: start } }
                };

                return $http.get('/api/v2016/reservations', { params: { q : query, f : fields, s: sort } });

            }).then(function(res){

                reservations = res.data;

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
                            documents : _.map(res.data, function(d) {
                                return _.defaults(d, {
                                    status:    detectDocumentStatus(d),
                                    sortKey:   buildSortKey(d),
                                    printable: d.type=='in-session'
                                });
                            })
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

                    var startOfDay = moment(r.start).tz(eventGroup.timezone).startOf('day').toISOString();
                    var startTime  = moment(r.start).tz(eventGroup.timezone).format("HH:mm");

                    r.day     = startOfDay;
                    r.dayPart = _(DAY_PARTS).find(function(p) { return startTime < p.end; }).code;

                    r.agenda.items.forEach(function(rItem) {

                        var mAgenda        = _(meetings)        .where({ code:     rItem.meeting }).map('agenda').flatten().first();
                        var mItem          = _(mAgenda.items)   .where({ item:     rItem.item   }).first();
                        var mItemDocuments = _(meetingDocuments).where({ meeting : rItem.meeting }).map('documents').flatten().where({ agendaItems: [rItem.item] }).value();

                        rItem.prefix    = (mAgenda||{}).prefix;
                        rItem.title     = (mItem||{}).title;
                        rItem.shortitle = (mItem||{}).shortitle;
                        rItem.scopes    = (mItem||{}).scopes;
                        rItem.documents = mItemDocuments; //todo
                        rItem.status    = rItem.status || detectAgendaItemStatus(rItem);
                    });
                });

                _ctrl.documents = _(meetingDocuments).map('documents').flatten().map(function(d) { d.status = detectDocumentStatus(d); return d; }).value();
                _ctrl.types     = _(reservationTypes).forEach(function(type) {

                    type.days = _(reservations).where({ type: type._id }).reduce(function(days, res) {

                        days[res.day]              = days[res.day]              || {};
                        days[res.day][res.dayPart] = days[res.day][res.dayPart] || [];
                        days[res.day][res.dayPart].push(res);

                        return days;
                    }, {});
                }).value();

            }).catch(console.error);
        }

        //==============================
        //
        //==============================
        function detectAgendaItemStatus(item) {

            var statusPriority = { 'pre-session' : 10, 'draft' : 20, 'crp' : 30, 'l' : 40 };

            return _(item.documents||[]).map('status').sortBy(function(s) { return statusPriority[s]||0; }).last();
        }

        //==============================
        //
        //==============================
        function detectDocumentStatus(d) {

            if(d.type=='in-session' && /\/CRP\//.test(d.symbol)) return 'crp';
            if(d.type=='in-session' && /\/L\//  .test(d.symbol)) return 'l';
            if(d.type=='in-session' && /\/L\//  .test(d.symbol)) return 'draft';
            if(d.type=='other')                                  return 'pre-session';
            if(d.type=='informational')                          return 'pre-session';
            if(d.type=='official')                               return 'pre-session';

            return 'UNKNOWN';
        }

        //==============================
        //
        //==============================
        function buildSortKey(d) {
            return d.symbol.replace(/\b(\d)\b/g, '0$1')
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
	}];
});
