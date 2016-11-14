define(['lodash', 'filters/lstring', 'directives/print-smart/print-smart-checkout', './meeting-document'], function(_) {
    //'css!./agenda.css' // moved to template
	return ["$scope", "$route", "$http", '$q', function ($scope, $route, $http, $q) {

        var tabs = [ 'outcome', 'in-session', 'official', 'informational', 'other', 'notification' ];
        var meetingCode = $route.current.params.meeting;

        var _ctrl = this;

        _ctrl.sort = 'document';

        load();

        //==============================
        //
        //==============================
        function load() {

            var meeting = $http.get('/api/v2016/meetings/'+meetingCode, { params: { f : { EVT_TIT_EN:1, EVT_CD:1, print:1 , agenda:1 } } }).then(function(res){
                res.data.code  = res.data.EVT_CD;
                res.data.title = res.data.EVT_TIT_EN;
                return res.data;
            });

            var documents = $http.get('/api/v2016/meetings/'+meetingCode+'/documents', { params: {  } }).then(function(res){
                return _.map(res.data, function(d) {
                    d.status  = detectDocumentStatus(d);
                    d.sortKey = buildSortKey(d);
                    return d;
                });
            });


            $q.all([meeting, documents]).then(function(res) {

                meeting   = res[0];
                documents = res[1];

                var agendaMap = _.reduce(meeting.agenda.items, function(r,v) { r[v.item] = v;  return r; }, {});

                documents.forEach(function(d) {
                    (d.agendaItems||[]).forEach(function(item) {

                        if(!agendaMap[item]) {
                            meeting.agenda.items.push(agendaMap[item] = { item: item, title: d.title.en + " (AUTO) "}); // LAZY during dev
                        }

                        agendaMap[item].documents = agendaMap[item].documents||[];
                        agendaMap[item].documents.push(d);
                    });
                });

                meeting.agenda.items.forEach(function(item) {
                    item.status = detectAgendaItemStatus(item);
                });

                _ctrl.meeting   = meeting;
                _ctrl.agenda    = meeting.agenda;
                _ctrl.documents = documents;
                _ctrl.tabs     = _(tabs).map(function(t){

                    var docs         = _(documents).where({ type : t }).value();
                    var items        = _(meeting.agenda.items).filter(function(item){ return _.some(item.documents, { type : t }); }).value();
                    var noAgendaDocs = _(docs).difference(_(items).map('documents').flatten().value()).value();

                    return {
                        code : t,
                        documents : docs,
                        agenda : {
                            items : items,
                            otherDocuments : noAgendaDocs
                        }
                    };
                }).filter(function(t) { return t.documents.length;
                }).sortBy(function(t) { return tabs.indexOf(t.code);
                }).value();
            });
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
	}];
});
