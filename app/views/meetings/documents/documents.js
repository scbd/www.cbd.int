define(['lodash', 'angular', 'dragula', 'filters/lstring', 'directives/print-smart/print-smart-checkout', './meeting-document', 'authentication'], function(_, ng) {
    //'css!./agenda.css' // moved to template
    var currentUser;

	return ["$scope", "$route", "$http", '$q', '$location', 'meeting', 'authentication', function ($scope, $route, $http, $q, $location, meetingCode, authentication) {

        var _ctrl = $scope.documentsCtrl = this;
        var meeting;
        var documents;

        _ctrl.sort = $location.hash() == 'agenda' ? 'agenda' : 'document';
        _ctrl.switchTab  = switchTab;

        $scope.$watch('documentsCtrl.sort', function(s){
            $location.hash(s=='agenda' ? 'agenda' : null);
        });

        initAffix();
        initEditor();
        load();
        loadNotifications();

        //==============================
        //
        //==============================
        function load() {

            meeting = $http.get('/api/v2016/meetings/'+meetingCode, { params: { f : { EVT_TIT_EN:1, EVT_CD:1, print:1 , agenda:1 } } }).then(function(res){

                meeting = _.defaults(res.data, {
                    code: res.data.EVT_CD,
                    title: res.data.EVT_TIT_EN,
                    agenda: { items: [] }
                });

                _ctrl.meeting = meeting;
                _ctrl.agenda  = meeting.agenda;


                return meeting;
            });

            documents = $http.get('/api/v2016/meetings/'+meetingCode+'/documents', { params: {  } }).then(function(res){

                documents = _(res.data).map(function(d){
                    d.metadata = _.defaults(d.metadata||{}, {
                        printable: ['crp', 'limited', 'non-paper'].indexOf(d.type)>=0,
                        visible : !!(d.files||[]).length
                    });

                    return d;

                }).filter(function(d){

                    return _ctrl.editMode || d.metadata.visible;

                }).sortBy(sortKey).value();

                _ctrl.documents = documents;

                return meeting;

            }).then(function() {

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

                var tabs = [
                    { code: 'outcome'       , title: 'Outcomes',    documents: _.filter(documents, byPositionGroup('outcome')) },
                    { code: 'in-session'    , title: 'Plenary',     documents: _.filter(documents, byPositionGroup('in-session')) },
                    { code: 'in-session/wg1', title: 'WG I',        documents: _.filter(documents, byPositionGroup('in-session/wg1')) },
                    { code: 'in-session/wg2', title: 'WG II',       documents: _.filter(documents, byPositionGroup('in-session/wg2')) },
                    { code: 'official'      , title: 'Official',    documents: _.filter(documents, byPositionGroup('official')) },
                    { code: 'information'   , title: 'Information', documents: _.filter(documents, byPositionGroup('information')) },
                    { code: 'other'         , title: 'Other',       documents: _.filter(documents, byPositionGroup('other')) },
                    { code: 'statement'     , title: 'Statements',  documents: _.filter(documents, byPositionGroup('statement')) },
                ];

                _ctrl.tabs = _(tabs).forEach(function(tab){

                    var itemIds = _(tab.documents).map('agendaItems').flatten().uniq().value();
                    var items   = _(meeting.agenda.items).filter(function(item) {

                        return ~itemIds.indexOf(item.item);

                    }).map(function(item){

                        return _.extend({}, item, {
                            documents : _.intersection(item.documents, tab.documents)
                        });
                    }).value();

                    var noAgendaDocs = _(tab.documents).difference(_(items).map('documents').flatten().value()).value();

                    tab.agenda = {
                        items : items,
                        otherDocuments : noAgendaDocs
                    };

                }).filter(function(t) {
                    return t.documents.length || t.code == 'in-session';
                }).value();

                injectNotifications();
                switchTab();

            }).catch(console.error);
        }

        //==============================
        //
        //==============================
        function byPositionGroup(code) {
            return function(doc) { return doc.positionGroup==code; };
        }

        //==============================
        //
        //==============================
        function loadNotifications() {

            $http.get('/api/v2013/index', { params: { q : 'schema_s:notification AND meeting_ss:'+meetingCode, fl: 'id,symbol_s,reference_s,meeting_ss,sender_s,title_*,date_dt,actionDate_dt,recipient_ss,url_ss', rows:999 } }).then(function(res){

                _ctrl.notifications = _(res.data.response.docs).map(function(n) {
                    return _.defaults(n, {
                        _id: n.id,
                        symbol: n.reference_s || n.symbol_s,
                        number: n.symbol_s,
                        date:   n.date_dt,
                        type:  'notification',
                        title : { en : n.title_t },
                        files : urlToFiles(n.url_ss)
                    });
                }).sortByOrder(['number', 'symbol'], ['desc', 'asc']).value();
            }).then(function(){

                injectNotifications();
                switchTab();

            }).catch(console.error);
        }

        //==============================
        //
        //==============================
        function injectNotifications(){

            if(!_ctrl.notifications || !_ctrl.notifications.length)
                return;

            _ctrl.tabs = _ctrl.tabs || [];

            if(!_.some(_ctrl.tabs, { code: 'notification' })) {

                _ctrl.documents = (_ctrl.documents||[]).concat(_ctrl.notifications);

                _ctrl.tabs.push({
                    code : 'notification',
                    title: 'Notifications',
                    documents : _ctrl.notifications
                });
            }
        }

        //==============================
        //
        //==============================
        function switchTab(tab, extra) {

            if(!tab && $location.search().tabFor) {
                tab = _(_ctrl.tabs).find(function(t) {
                    return _(t.documents).some({_id:$location.search().tabFor});
                });
            }

            if(tab && $location.search().tabFor)
                $location.search({tabFor:null});

            if(!tab && !_ctrl.currentTab)
                tab = _ctrl.tabs[0];

            if(!tab && _ctrl.currentTab)
                tab = _(_ctrl.tabs).findWhere({ code :_ctrl.currentTab });

            if(!tab)
                return;

            if(!tab.loaded && _ctrl.editMode) {
                initDragdrop();
            }

            tab.loaded=true;
            _ctrl.currentTabX = tab;
            _ctrl.currentTab  = tab.code;

            _ctrl.currentExtraTab = extra ? tab.title : null;
        }

        //==============================
        //
        //==============================
        function initDragdrop() {

            setTimeout(function() {
            require(['dragula'], function(dragula) {

                ng.element("tbody.documents:not(.drag-ready)").each(function(i,element){

                    ng.element(element).addClass("drag-ready"); //prevent double initialization

                    dragula([element], {
                        moves: function (el, source, handle) {
                            return handle.classList.contains('handle');
                        },

                    }).on('drop', function(el) {

                        var curr = ng.element(el)       .attr('document-id');
                        var prev = ng.element(el).prev().attr('document-id') || "000000000000000000000000";
                        var next = ng.element(el).next().attr('document-id') || "ffffffffffffffffffffffff";

                        var data = { between : [prev, next] };

                        $http.put('/api/v2016/meetings/'+meetingCode+'/documents/'+curr+'/position', data).then(function(){
                            load();
                        }).catch(console.error);

                    });
                });

            });
        }, 100);
        }

        //==============================
        //
        //==============================
        function sortKey(d) {
            return ("000000000" + (d.position||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   (d.symbol||"").replace(/\b(\d)\b/g, '0$1')
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
                    type : mime,
                    language: locale,
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

        // EDIT


        //==============================
        //
        //==============================
        function initEditor() {

            $q.when(currentUser || authentication.getUser()).then(function(user){
                currentUser = user;

                if(!user.isAuthenticated)
                    return;

                if(!_.intersection(user.roles||[], ["Administrator","EditorialService"]).length)
                    return;

                _ctrl.edit       = edit;
                _ctrl.editMode   = $scope.$root.documentEditMode;

                $scope.$watch('documentsCtrl.editMode', function(n,o){
                    $scope.$root.documentEditMode = n;
                    if(n!=o) load();
                });
            });
        }


        //==============================
        //
        //==============================
        function edit(doc) {

            var id = doc ? doc._id : 'new';

            $location.url('/management/'+meeting.code+ '/documents/'+id);
        }
	}];
});
