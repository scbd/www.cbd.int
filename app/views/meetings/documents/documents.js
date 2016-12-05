define(['lodash', 'angular', 'filters/lstring', 'directives/print-smart/print-smart-checkout', './meeting-document'], function(_, ng) {
    //'css!./agenda.css' // moved to template
	return ["$scope", "$route", "$http", '$q', '$location', 'meeting', function ($scope, $route, $http, $q, $location, meetingCode) {

        var TABS_NAMES = {
            'outcome'      : 'Outcomes',
            'in-session'   : 'In-session',
            'official'     : 'Official',
            'informational': 'Information',
            'other'        : 'Others',
            'notification' : 'Notifications',
            'statement'    : 'Statements'
        };

        var _ctrl = $scope.documentsCtrl = this;

        _ctrl.sort = $location.hash() == 'agenda' ? 'agenda' : 'document';
        _ctrl.switchTab = switchTab;
        _ctrl.TABS_NAMES = TABS_NAMES;

        $scope.$watch('documentsCtrl.sort', function(s){
            $location.hash(s=='agenda' ? 'agenda' : null);
        });

        initAffix();
        load();

        //==============================
        //
        //==============================
        function load() {

            var meeting = $http.get('/api/v2016/meetings/'+meetingCode, { params: { f : { EVT_TIT_EN:1, EVT_CD:1, print:1 , agenda:1, documents:1 } } }).then(function(res){

                meeting = _.defaults(res.data, {
                    code: res.data.EVT_CD,
                    title: res.data.EVT_TIT_EN,
                    agenda: { items: [] }
                });

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



            $http.get('/api/v2013/index', { params: { q : 'schema_s:notification AND meeting_ss:'+meetingCode, fl: 'id,symbol_s,reference_s,meeting_ss,sender_s,title_*,date_dt,actionDate_dt,recipient_ss,url_ss', rows:999 } }).then(function(res){

                _ctrl.notifications = _.map(res.data.response.docs, function(n) {
                    return _.defaults(n, {
                        _id: n.id,
                        symbol: n.reference_s || n.symbol_s,
                        number: n.symbol_s,
                        date:   n.date_dt,
                        type:  'notification',
                        title : { en : n.title_t },
                        sortKey : n.symbol_s,
                        files : urlToFiles(n.url_ss)
                    });
                });
            }).then(function(){

                injectNotifications();
                switchTab();

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

            var tabs = _.keys(TABS_NAMES);

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

            injectNotifications();
            switchTab();

            if(!_(_ctrl.tabs).some({ code : 'in-session' })) {
                _ctrl.tabs = [{ code : 'in-session', documents:[] }].concat(_ctrl.tabs);
            }
        }

        //==============================
        //
        //==============================
        function injectNotifications(){

            if(!_ctrl.notifications || !_ctrl.notifications.length)
                return;

            _ctrl.tabs = _ctrl.tabs || [];

            if(!_.some(_ctrl.tabs, { code: 'notification'})) {

                _ctrl.documents = (_ctrl.documents).concat(_ctrl.notifications);

                _ctrl.tabs.push({
                    code : 'notification',
                    documents : _ctrl.notifications
                });
            }
        }

        //==============================
        //
        //==============================
        function switchTab(tab) {

            if(!tab && !_ctrl.currentTab)
                tab = _ctrl.tabs[0];

            if(!tab)
                return;

            tab.loaded=true;
            _ctrl.currentTab = tab.code;
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
            return ("000000000" + (d.priority||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   d.symbol.replace(/\b(\d)\b/g, '0$1')
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
