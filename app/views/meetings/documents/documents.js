define(['lodash', 'filters/lstring', 'directives/print-smart/print-smart-checkout', './meeting-document'], function(_) {
    //'css!./agenda.css' // moved to template
	return ["$scope", "$route", "$http", '$q', '$location', 'meeting', function ($scope, $route, $http, $q, $location, meetingCode) {

        var tabs = [ 'outcome', 'in-session', 'official', 'informational', 'other', 'notification' ];

        var _ctrl = $scope.documentsCtrl = this;

        _ctrl.sort = $location.hash() == 'agenda' ? 'agenda' : 'document';

        $scope.$watch('documentsCtrl.sort', function(s){
            $location.hash(s=='agenda' ? 'agenda' : null);
        });

        load();

        //==============================
        //
        //==============================
        function load() {

            var meeting = $http.get('/api/v2016/meetings/'+meetingCode, { params: { f : { EVT_TIT_EN:1, EVT_CD:1, print:1 , agenda:1, documents:1 } } }).then(function(res){

                meeting       = res.data;
                meeting.code  = meeting.code  || meeting.EVT_CD;
                meeting.title = meeting.title || meeting.EVT_TIT_EN;

                return meeting;
            });

            var meetingDocs = $http.get('/api/v2016/meetings/'+meetingCode+'/documents', { params: {  } }).then(function(res){

                meetingDocs = _(res.data).map(function(d) {
                    return _.defaults(d, {
                        status  : detectDocumentStatus(d),
                        sortKey : buildSortKey(d),
                        printable : d.type=='in-session'
                    });
                }).filter(function(d){
                    return d.files && d.files.length;
                }).value();

                return meetingDocs;
            });

            meeting.then(function() {

                var copy = _.cloneDeep(meeting);

                merge(copy, copy.documents);

                return meetingDocs;

            }).then(function() {

                merge(meeting, meetingDocs);

            }).catch(console.error);



            $http.get('https://api.cbd.int/api/v2013/index', { params: { q : 'schema_s:notification AND meeting_ss:'+meetingCode, fl: 'symbol_s,reference_s,meeting_ss,sender_s,title_*,date_dt,actionDate_dt,recipient_ss,url_ss', rows:999 } }).then(function(res){

                _ctrl.notifications = _.map(res.data.response.docs, function(n) {
                    return _.defaults(n, {
                        symbol: n.reference_s || n.symbol_s,
                        number: n.symbol_s,
                        date:   n.date_dt,
                        type:  'notification',
                        title : { en : n.title_t },
                        sortKey : n.symbol_s,
                        files : urlToFiles(n.url_ss)
                    });
                });
            }).catch(console.error);
        }

        //==============================
        //
        //==============================
        function merge(meeting, documents) {

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
        function urlToFiles(url_ss) {

            return _.map(url_ss||[], function(url){

                var mime;
                var locale;

                if(/\.pdf$/ .test(url)) mime = 'application/pdf';
                if(/\.doc$/ .test(url)) mime = 'application/msword';
                if(/\.docx$/.test(url)) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

                if(/-ar\.\w+$/ .test(url)) locale = 'ar';
                if(/-en\.\w+$/ .test(url)) locale = 'en';
                if(/-es\.\w+$/ .test(url)) locale = 'es';
                if(/-fr\.\w+$/ .test(url)) locale = 'fr';
                if(/-ru\.\w+$/ .test(url)) locale = 'ru';
                if(/-zh\.\w+$/ .test(url)) locale = 'zh';

                return {
                    mime : mime,
                    locale: locale,
                    url : 'https://www.cbd.int'+url
                };
            });
        }
	}];
});
