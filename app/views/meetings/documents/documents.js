define(['lodash', 'angular', 'filters/lstring', 'directives/print-smart/print-smart-checkout', './meeting-document', 'authentication',
        'css!./meeting-documents.css', 'angular-cache', 'css!./agenda.css', 'filters/moment'
], function(_, ng) {
    //'css!./agenda.css' // moved to template
    var STATISTICS = {}; 

	return ["$scope", "$route", "$http", '$q', '$location', '$rootScope', 'authentication', 'showMeeting', 'CacheFactory', function ($scope, $route, $http, $q, $location, $rootScope, authentication, showMeeting, CacheFactory) {

        var _ctrl = $scope.documentsCtrl = this;
        var meetingCode = $route.current.params.meeting.toUpperCase();
        var hardTab = false;
        var httpCache = initCache();
        var currentUser;

        var groups = {
            'outcome'        : { position: 100 , title : 'Outcomes'      },
            'official'       : { position: 200 , title : 'Official'      },
            'information'    : { position: 300 , title : 'Information'   },
            'statement'      : { position: 400 , title : 'Statements',   insession: true },
            'notification'   : { position: 500 , title : 'Notifications' },
            'other'          : { position: 600 , title : 'Other'         },
            'in-session'     : { position: 700 , title : 'Plenary',      insession: true },
            'in-session/wg1' : { position: 800 , title : 'WG I',         insession: true },
            'in-session/wg2' : { position: 900 , title : 'WG II',        insession: true }
        };

        var sections = {
            'outcome/report':         { position: 100 , title : 'Final Report'    },
            'outcome/decision':       { position: 200 , title : 'Decisions'       },
            'outcome/recommendation': { position: 200 , title : 'Recommendations' },
        };

        _ctrl.showMeeting = showMeeting===undefined ? true : !!showMeeting;
        _ctrl.sort = $location.hash() == 'agenda' ? 'agenda' : 'document';
        _ctrl.tabs = [];
        _ctrl.switchTab  = switchTab;

        $scope.$watch('documentsCtrl.sort', function(s){
            $location.hash(s=='agenda' ? 'agenda' : null);
        });

        $scope.$watch('$root.deviceSize', updateMaxTabCount);

        initAffix(); //to be fixed later
        initSecurity();
        load();

        //==============================
        //
        //==============================
        function load() {
            _ctrl.inSessionEnabled = false; //to adjust the height for non insession case
            var meeting = $http.get('/api/v2016/meetings/'+meetingCode, { cache: httpCache, params: { f : { EVT_CD:1, reportDocument:1,  printSmart:1, insession:1, agenda:1, links:1, title:1, venueText:1, dateText:1, EVT_WEB:1, EVT_INFO_PART_URL:1, EVT_REG_NOW_YN:1, EVT_STY_CD:1 }, cache:true } }).then(function(res){

                meeting = _.defaults(res.data, {
                    code: res.data.EVT_CD,
                    agenda: { items: [] },
                    printSmart : false,
                    isMontreal : /montr.al.*canada/i.test((res.data.venueText||{}).en||'')
                });

                _ctrl.noTabs  = meeting.EVT_STY_CD=='BAR';
                _ctrl.meeting = meeting;
                _ctrl.agenda  = meeting.agenda;

                if(meeting.insession) { // Quick insession fix
                    groups['in-session']    .position = 110;
                    groups['in-session/wg1'].position = 120;
                    groups['in-session/wg2'].position = 130;
                    _ctrl.inSessionEnabled = true;
                }

                return meeting;
            }).catch(function(err) {

                if(err.status!=404)
                    throw err;

                _ctrl.error = "meetingNotFound";
            });

            $q.when(httpCache.reValidate()).then(function(){

                return $http.get('/api/v2016/meetings/'+encodeURIComponent(meetingCode)+'/documents', { cache: httpCache, params: { cache:!_ctrl.isEditor } });

            }).then(function(res){

                return initSecurity().then(function(){ return res; });

            }).then(function(res) {

                _ctrl.documents = documents = _(res.data).map(normalizeDocument).filter(isDocumentVisible).sortBy(sortKey).value();

                return meeting; // force resolve

            }).then(function(meeting) {

                if(!meeting)
                    return;

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


                for(var group in groups) {

                    var docs =  _.where(documents, { displayGroup : group });

                    if(!docs.length)
                        continue;

                    var itemIds = _(docs).map('agendaItems').flatten().uniq().value();
                    var items   = _(meeting.agenda.items).filter(function(item) {
                        return ~itemIds.indexOf(item.item);
                    }).map(function(item){
                        return _.extend({}, item, { documents : _.intersection(item.documents, docs) });
                    }).value();

                    var noAgendaDocs = _(docs).difference(_(items).map('documents').flatten().value()).value();

                    var tab = injectTab(group, docs);

                    tab.insession = isInSessionTab(tab);

                    if(items.length) {
                        tab.agenda = {
                            items : items,
                            otherDocuments : noAgendaDocs
                        };
                    }
                }

                updateMaxTabCount();
                loadReport();
                loadDecisions();
                loadNotifications();
            }).then(function(){
                switchTab();
            }).catch(console.error).finally(function(){ _ctrl.loaded = true; });
        }

        //==============================
        //
        //==============================
        function normalizeDocument(d){
            
            d.status = d.status||'public';

            d.metadata = _.defaults(d.metadata||{}, { 
                printable: ['crp', 'limited', 'non-paper'].indexOf(d.nature)>=0,
                visible : (d.status=='public' || (_ctrl.isStaff && d.status == 'staff')) && !!(d.files||[]).length
            });
            
            // TO REVIEW
            if(d.status!='public' && !(_ctrl.isStaff && d.status == 'staff'))
                delete d.metadata.visible;

            return d;
        }

        //==============================
        //
        //==============================
        function isDocumentVisible(d){

            return d && (_ctrl.editMode || d.metadata.visible);
        }

        //==============================
        //
        //==============================
        function updateMaxTabCount(){

            (_(_ctrl.tabs).first({ insession: true })||{}).insessionFirst = true;
            (_(_ctrl.tabs).last ({ insession: true })||{}).insessionLast  = true;

            var size = $rootScope.deviceSize;

                 if(size=='xs') _ctrl.maxTabCount = 2;
            else if(size=='sm') _ctrl.maxTabCount = 4;
            else if(size=='md') _ctrl.maxTabCount = 5;
            else if(size=='lg') _ctrl.maxTabCount = 6;
            else                _ctrl.maxTabCount = 7;

            if(_ctrl.tabs && _ctrl.tabs.length && (_ctrl.tabs.length - _ctrl.maxTabCount) <= 1) {
                _ctrl.maxTabCount = 999;
            }

            if(_ctrl.tabs && _ctrl.tabs.length && !_ctrl.meeting.insession && _.findIndex(_ctrl.tabs, isInSessionTab)>0) {
                _ctrl.maxTabCount = Math.min(_ctrl.maxTabCount, _.findIndex(_ctrl.tabs, isInSessionTab));
            }


        }

        //==============================
        //
        //==============================
        function isInSessionTab(tab) {
            return /^in-session/.test(tab.code);
        }

        //==============================
        //
        //==============================
        function loadNotifications() {

            $http.get('/api/v2013/index', { params: { q : 'schema_s:notification AND meeting_ss:'+meetingCode, fl: 'id,symbol:symbol_s,reference:reference_s,meeting_ss,sender_s,title_*,date_dt,actionDate_dt,recipient_ss,url_ss', rows:999 } }).then(function(res){

                return _(res.data.response.docs).map(function(n) {
                    return normalizeDocument(_.defaults(n, {
                        _id: n.id,
                        date:   n.date_dt,
                        type:  'notification',
                        url: '/notifications/'+encodeURIComponent(n.symbol),
                        status : 'public',
                        title : { en : n.title_t },
                        files : urlToFiles(n.url_ss)
                    }));
                }).sortByOrder(['number', 'symbol'], ['desc', 'asc']).value();

            }).then(function(docs){

                injectTab('notification', docs);
                switchTab();

            }).catch(console.error);
        }

        //==============================
        //
        //==============================
        function loadDecisions() {

            $http.get('/api/v2013/index', { params: { q : 'schema_s:(decision recommendation) AND meeting_ss:'+meetingCode, fl: 'id,symbol_s,schema_s,position_i,meeting_ss,title_*, description_*,file_ss,url_ss', rows:999 } }).then(function(res){

                return _(res.data.response.docs).map(function(n) {
                    var doc = _.defaults(n, {
                        _id: n.id,
                        symbol: n.symbol_s,
                        type:   n.schema_s.replace(/^x-/, ''),
                        status : 'public',
                        title : { en : n.title_t },
                        files : _.map(n.file_ss, function(f){ return JSON.parse(f); }),
                        url :  n.url_ss[0]
                    });

                    if(!doc.files || !doc.files.length)
                        doc.files = [{ language:'en', url:doc.url,  type:'text/html' }];

                    return normalizeDocument(doc);

                }).sortByOrder(['position_i', 'symbol_s'], ['asc', 'asc']).value();

            }).then(function(docs){

               injectTab('outcome',  _.where(docs, { type : 'decision'}),       { section: 'decision' });
               injectTab('outcome',  _.where(docs, { type : 'recommendation'}), { section: 'recommendation' });

                switchTab(!hardTab ? findTab('outcome') : null);

            }).catch(console.error);
        }

        //==============================
        //
        //==============================
        function loadReport() {

            var report = _.find(_ctrl.documents||[], function(d){
                return d._id==_ctrl.meeting.reportDocument;
            });

            if(!report && _ctrl.meeting.reportDocument) {
                report = $http.get('/api/v2016/documents/'+encodeURIComponent(_ctrl.meeting.reportDocument)).then(function(res){
                    return res.data;
                }).catch(function(e){
                    if(e.status==404) 
                        return null;
                    console.error(e);
                });
            }

            $q.when(report).then(function(report){

                if(!report) return;

                report = normalizeDocument(report);

                if(!isDocumentVisible(report))
                    return;

                injectTab('outcome', [report], { section: 'report' });
                switchTab(!hardTab ? findTab('outcome') : null);
            });
        }

        //==============================
        //
        //==============================
        function injectTab(code, docs, options){

            if(!docs || !docs.length)
                return;

            options = _.defaults(options||{}, {
                section: null
            });

            var tab = findTab(code);

            if(!tab) {

                tab = {
                    code : code,
                    title:     (groups[code]||{}).title||code.toUpperCase(),
                    insession: (groups[code]||{}).insession,
                    sections : [] 
                };

                _ctrl.tabs.push(tab);
                _ctrl.tabs = _.sortBy(_ctrl.tabs, function(t){
                    return (groups[t.code]||{}).position || 9999;
                });
            }

            var section = _.find(tab.sections, function(s) { return s.code==options.section; });

            if(!section) {


                section = {
                    code : options.section,
                    title: (sections[tab.code+'/'+options.section]||{}).title,
                };

                tab.sections.push(section);
                tab.sections = _.sortBy(tab.sections, function(s){
                    return (sections[tab.code+'/'+s.code]||{}).position || 9999;
                });
            }

            section.documents = docs;
            tab    .length    = _.sum(tab.sections, function(s) { return s.documents.length; });

            updateMaxTabCount();

            return tab;
        }

        //==============================
        //
        //==============================
        function findTab(code) {

            _ctrl.tabs = _ctrl.tabs || [];

            return _(_ctrl.tabs).find(function(t) {
                return t.code==code;
            });
        }

        //==============================
        //
        //==============================
        function switchTab(tab, extra) {
            $scope.$applyAsync(function(){
                switchTabDirect(tab, extra);
            });
        }

        //==============================
        //
        //==============================
        function switchTabDirect(tab, extra) {

            if(!tab && $location.search().tabFor) {
                tab = _(_ctrl.tabs).find(function(t) {
                    return _(t.sections).map('documents').flatten().some({_id:$location.search().tabFor});
                });
            }

            hardTab = hardTab || !!tab;

            if(tab && $location.search().tabFor)
                $location.search({tabFor:null});

            if(!tab && !_ctrl.currentTab)
                tab = _ctrl.tabs[0];

            if(!tab && _ctrl.currentTab)
                tab = _(_ctrl.tabs).findWhere({ code :_ctrl.currentTab });

            if(!tab)
                return;

            if(!tab.dragdropInit && _ctrl.editMode) {
                tab.dragdropInit = true;
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

            var parts = [];

            if(d.nature=='statement')    
                parts.push(((d.statementSource||{}).date||'9999-12-31')+"T99:99")


            parts.push(("000000000" + (d.displayPosition||9999)).slice(-9))
            parts.push((d.symbol||"").replace(/\b(\d)\b/g, '0$1')
                                     .replace(/(\/REV)/gi, '0$1')
                                     .replace(/(\/ADD)/gi, '1$1'));

            return parts.join('_');
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

                if(psc.length) {
                    // psc.affix({ offset: { top:psc.offset().top - 10 } });
                    affixReady();
                }
            });
        }

        // EDIT


        //==============================
        //
        //==============================
        function initSecurity() {

            currentUser = currentUser || $q.when(authentication.getUser()).then(function(user){

                currentUser = user;

                _ctrl.isEditor = authentication.isInRole(user, ["EditorialService"]);
                _ctrl.isStaff  = authentication.isInRole(user, ["ScbdStaff"]) || _ctrl.isEditor;

                if(!user.isAuthenticated)
                    return;

                if(_ctrl.isEditor) {
                    _ctrl.edit       = edit;
                    _ctrl.editMode   = $scope.$root.documentEditMode;

                    $scope.$watch('documentsCtrl.editMode', function(n,o){
                        $scope.$root.documentEditMode = n;
                        if(n!=o) load();
                    });
                }
            });
            return $q.when(currentUser);
        }


        //==============================
        //
        //==============================
        function edit(doc) {

            var id =   doc && doc._id             || 'new';
            var base = encodeURIComponent($route.current.params.code || '');

            $location.url([base, encodeURIComponent(_ctrl.meeting.code), 'documents', encodeURIComponent(id)].join('/'));
        }

        //==============================
        //
        //==============================
        function initCache() {

            var cacheId = 'meeting_documents_'+meetingCode;
            var cache   = CacheFactory.get(cacheId)
            
            if(!cache) {

                cache = CacheFactory.createCache(cacheId, {
                    deleteOnExpire: 'aggressive',
                    recycleFreq   : 10000,
                    maxAge        : 5 * 60 * 1000,
                    storageMode   : 'memory',
                    storagePrefix : 'httpCache_'
                });

                cache.reValidate = function() {

                    var thisCache = this;
                    
                    return $http.get('/api/v2016/meetings/'+encodeURIComponent(meetingCode)+'/documents/statistics').then(function(res){

                        var oldStats = STATISTICS[meetingCode] || thisCache.get('statistics');
                        var newStats = res.data;

                        if(!_.isEqual(oldStats, newStats)) {
                            thisCache.removeAll();
                            thisCache.put('statistics', newStats);
                            STATISTICS[meetingCode]   = newStats;
                        }

                        return thisCache;

                    }).catch(function(){

                        thisCache.removeAll();
                        return thisCache;
                    });
                };
            }

            return cache;
        }
	}];
});
