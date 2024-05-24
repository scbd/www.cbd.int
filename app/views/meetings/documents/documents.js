import 'angular-vue'
import '~/directives/print-smart/print-smart-checkout'
import './meeting-document'
import '~/authentication'
import 'angular-cache'
import '~/filters/lstring'
import '~/filters/moment'
import 'css!./meeting-documents.css'
import 'css!./agenda.css'
import _ from 'lodash'
import ng from 'angular'
import moment from 'moment'
import displayGroups from './display-groups'
import * as meta from '~/services/meta'
import AgendaItem from '~/components/meetings/sessions/agenda-item.vue'
import { normalizeMeeting, normalizeDocumentSymbol, documentSortKey as sortKey } from '~/services/meetings'
import '~/filters/to-display-symbol';

export { default as template } from './documents.html';

    //'css!./agenda.css' // moved to template
    var STATISTICS = {}; 

	export default ["$scope", "$route", "$http", '$q', '$location', '$rootScope', 'authentication', 'showMeeting', 'CacheFactory', '$cookies', 'apiToken', 'locale', 
           function ($scope,   $route,   $http,   $q,   $location,   $rootScope,   authentication,   showMeeting,   CacheFactory,   $cookies,   apiToken,   locale) {

        var _ctrl = $scope.documentsCtrl = this;
        var meetingCode = $route.current.params.meeting.toUpperCase();
        var hardTab = false;
        var httpCache = initCache();
        let allDocuments = [];
        var currentUser;


        $scope.tokenReader = function(){ return apiToken.get()}
        $scope.route       = { params : $route.current.params, query: $location.search() }
        $scope.vueOptions  = {
          components: { AgendaItem },
          i18n: new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: {} } })
        };

        function registerComponents(components) {

            Object.keys(components).forEach((name) => {
                const component = components[name].default || components[name];
                $scope.vueOptions.components[name] = component;
            });
        }


        var groups = { ...displayGroups }

        var sections = {
            'outcome/report':         { position: 1000 , title : 'Final Report'    },
            'outcome/decision':       { position: 2000 , title : 'Decisions'       },
            'outcome/recommendation': { position: 2000 , title : 'Recommendations' },
        };

        _ctrl.jumpTo = jumpTo;
        _ctrl.showMeeting = showMeeting===undefined ? true : !!showMeeting;
        _ctrl.uploadStatement = false;
        _ctrl.sort = $location.hash() == 'agenda' ? 'agenda' : 'document';
        _ctrl.tabs = [];
        _ctrl.switchTab  = switchTab;
        _ctrl.hideAlert  = hideAlert;
        _ctrl.notify = function(msg) {
            $scope.$emit("showInfo", msg);
        }

        _ctrl.selectedDocuments = () => allDocuments.filter(o => o.selected);

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
            let documents = null;
            _ctrl.inSessionEnabled = false; //to adjust the height for non insession case
            const meeting = $http.get('/api/v2016/meetings/'+meetingCode, { cache: httpCache, params: { f : { EVT_CD:1, reportDocument:1,  printSmart:1, insession:1, uploadStatement:1, agenda:1, links:1, title:1, venueText:1, dateText:1, EVT_WEB:1, EVT_INFO_PART_URL:1, EVT_REG_NOW_YN:1, EVT_STY_CD:1, alerts:1, displayGroups:1 }, cache:true } }).then(async function(res){
                const meeting = normalizeMeeting(res.data, {
                    code: res.data.EVT_CD,
                    agenda: { items: [] },
                    printSmart : false,
                    isMontreal : /montr.al.*canada/i.test((res.data.venueText||{}).en||'')
                });

                meta.title(`${meeting.code} - Documents`);

                if(meeting.uploadStatement) {
                    registerComponents({uploadStatementButton : await import('~/components/meetings/upload-statement-button.vue') });
                }

                meeting.alerts = _(meeting.alerts||[]).map(fixAlertHash).filter(isAlertVisible).value();
              
                _ctrl.noTabs  = meeting.EVT_STY_CD=='BAR';
                _ctrl.meeting = meeting;
                _ctrl.agenda  = meeting.agenda;

                margeToGroups(meeting.displayGroups||{});

                if(meeting.insession) { // Quick insession fix

                    let position        = groups.outcome.position || 1000;
                    let inSessionGroups = _(groups).filter((o)=>!!o.insession).sortBy((o)=>o.position).value();

                    inSessionGroups.forEach(g=>g.position = (++position));

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

                const sortKeyOptions = {
                    baseSymbol : _ctrl.meeting.EVT_UN_CD,
                    locale
                }

                _ctrl.documents = documents = _(res.data)
                    .map(normalizeDocument)
                    .map((d)=>{
                        const code = d.normalizedSymbol || d.symbol || d._id;
                        const url  = `/documents/${code}`;
                        
                        return { 
                            url, 
                            sortKey : sortKey(d, sortKeyOptions),
                            ...d 
                        };
                    })                    
                    .filter(isDocumentVisible)
                    .sortBy((d) => d.sortKey)
                    .value();

                return meeting; // force resolve

            }).then(function(meeting) {
          
                if(!meeting)
                    return;

                const { agenda } = meeting;
                const { color, prefix } = agenda;

                documents.forEach(function(doc) {

                    const docItems = doc.agendaItems||[];

                    doc.agendaItems = docItems.map(dItem=>{
                        let item = agenda.items.find(i=>i.item == dItem);

                        if(!item) {
                            item = { prefix, color, item : dItem };
                            agenda.items.push(item)
                        }

                        item.documents = item.documents || [];
                        item.documents.push(doc);

                        return item;
                    })
                });

                for(var group in groups) {
                    var docs =  _.where(documents, { displayGroup : group });

                    if(!docs.length)
                        continue;

                    var itemIds = _(docs).map('agendaItems').flatten().map(o=>o.item).uniq().value();
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
                
                return $q.all([
                    loadReport(),
                    loadDecisions(),
                    loadNotifications(),
                    loadSessions(),
                ]);

            }).then(function(){
                switchTab();

                if($scope.focusDocumentId) 
                    jumpTo($scope.focusDocumentId);


            }).catch(console.error).finally(function(){ _ctrl.loaded = true; });
        }

        //==============================
        //
        //==============================
        function margeToGroups(meetingDisplayGroups) {

            const keys = Object.keys(meetingDisplayGroups || {});

            keys.forEach(key=>{

                const oldGroup = groups[key];
                const newGroup = meetingDisplayGroups[key];

                groups[key] = { ...(oldGroup||{}), ...newGroup }
            })
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
            
            if(d.nature=='statement' && (d.statementSource||{}).date){
                var currentTime         = moment.tz(d.statementSource.date, 'UTC');
                var formatedDate        = currentTime.format('HH:mm')
                
                if(formatedDate < '05:00')
                    d.statementSource.session = 'Evening'
                else if(formatedDate < '15:00')
                    d.statementSource.session = 'Morning'
                else if(formatedDate < '20:30')
                    d.statementSource.session = 'Afternoon'
                else
                    d.statementSource.session = 'Evening'
            }

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

            const { insession }  =  _ctrl.meeting||{};

            if(_ctrl.tabs && _ctrl.tabs.length && !insession && _.findIndex(_ctrl.tabs, isInSessionTab)>0) {
                _ctrl.maxTabCount = Math.min(_ctrl.maxTabCount, _.findIndex(_ctrl.tabs, isInSessionTab));
            }
        }

        //==============================
        //
        //==============================
        function isInSessionTab(tab) {
            return /^in-session/.test(tab.code) || tab.insession;
        }

        //==============================
        //
        //==============================
        async function loadSessions() {

            try {

                const f = { count: 1 };
                const q = { 
                    meetingIds: { $in :[ { $oid: _ctrl.meeting._id }] }, 
                    count:      { $gt: 0 } 
                };

                var pSessions = $http.get('/api/v2021/meeting-sessions', { params: { q, f } }).then(res=>res.data);
                var pPending  = $http.get('/api/v2021/meeting-interventions', { params: { q: { meetingId : { $oid: _ctrl.meeting._id }, status:{ $ne: "public"} }, c:1 } }).then(res=>res.data);

                const sessions = [...(await pSessions), ...(await pPending)];

                const count = sessions.reduce((a,s)=>a+s.count, 0);;

                if(!count) return;

                var fakeDocs = []; 
                fakeDocs.length = count;

                registerComponents({ sessions : await import('~/components/meetings/sessions/view.vue') });

                $scope.$applyAsync(()=>{
                    injectTab('statement', fakeDocs, { component:'sessions' });
                })
            }
            catch(e) {
                console.error(e)
            };
        }

        //==============================
        //
        //==============================
        function loadNotifications() {

            $http.get('/api/v2013/index', { params: { q : 'schema_s:notification AND meeting_ss:'+meetingCode, fl: 'id,symbol:symbol_s,reference:reference_s,meeting_ss,sender_s,title_*,date_dt,actionDate_dt,recipient_ss,url_ss,files_ss', rows:999 } }).then(function(res){

                return _(res.data.response.docs).map(function(n) {
                    const [webUrl] = n.url_ss;;

                    return normalizeDocument(_.defaults(n, {
                        _id: n.id,
                        date:   n.date_dt,
                        type:  'notification',
                        url: webUrl,
                        status : 'public',
                        title : { en : n.title_t },
                        files : [...urlToFiles([webUrl]), ...JSON.parse(n.files_ss)]//  urlToFiles(n.url_ss)
                    }));
                }).sortByOrder(['symbol', 'reference'], ['desc', 'asc']).value();

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

               switchTab(null);

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
                switchTab(null);
            });
        }

        //==============================
        //
        //==============================
        function injectTab(code, docs, options){

            if(!docs || !docs.length)
                return;

            docs.forEach((d) => allDocuments.push(d));

            options = _.defaults(options||{}, {
                section: null,
                component: null
            });

            var tab = findTab(code);

            if(!tab) {

                if(groups[code]?.visible===false) return; // do not add tab if forced not visible

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
                    component: options.component
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
        function lookupFor(documentCodeOrId) {

            const id     = documentCodeOrId;
            const symbol = normalizeDocumentSymbol(documentCodeOrId);

            let document = null;

            const tab = _(_ctrl.tabs).find((t) => {
                document = _(t.sections).map('documents').flatten().compact().find((d) => {
                    return d._id == id 
                        || normalizeDocumentSymbol(d.symbol) == symbol
                        || d?.metadata?.patterns?.includes(id)
                })
                return !!document;
            });

            if(document) return { document, tab };

            return null;
        }

        //==============================
        //
        //==============================
        function jumpTo(documentCodeOrId) {

            const result = lookupFor(documentCodeOrId);

            if(!result) return;

            const id = result.document._id;
            
            switchTabDirect(result.tab);
            
            setTimeout(()=> {
                $scope.$apply(()=>{
                    $scope.focusDocumentId = id
                    const tr = document.querySelector(`tr[document-id="${id}"]`);
                    tr?.scrollIntoView({ block: "center", behavior: "smooth" });
                })
            }, 100);
        }

        //==============================
        //
        //==============================
        function switchTabDirect(tab, extra) {

            if(!tab && $location.search().doc) {

                const result = lookupFor($location.search().doc);

                $scope.focusDocumentId = result?.document?._id;
                tab = result?.tab;

                $location.search({doc:null});
            }

            hardTab = hardTab || !!tab;

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
            import('dragula').then(function({ default: dragula }) {

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
        function urlToFiles(url_ss) {

            return _.map(url_ss||[], function(url){

                var mime = 'text/html';
                var locale = 'en';

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

        //==============================
        //
        //==============================
        function fixAlertHash(alert) {

            alert = _.omit(alert, '_hash');
            alert._hash = getObjectHash(alert).toString();

            return alert;
        } 

        //==============================
        //
        //==============================
        function isAlertVisible(alert) {
            return loadPref().alerts[alert._hash]!==false;
        }

        //==============================
        //
        //==============================
        function hideAlert(alert) {

            if(!alert || !alert._hash)
                return;

            var pref = loadPref();

            pref.alerts[alert._hash] = false;

            savePref(pref);
        }
        
        //==============================
        //
        //==============================
		function savePref(pref) {

			var expires = new Date();
			expires.setDate(expires.getDate()+14); //in 14 days;

			$cookies.put("meetingPref", JSON.stringify(pref, null, ''), { path:location.pathname, expires: expires });
		}

        //==============================
        //
        //==============================
		function loadPref() {

            var pref = {};
			try {
				pref = JSON.parse($cookies.get("meetingPref")||'{}')
			}
			catch(e){ }
            
            pref.alerts = pref.alerts || {};

            return pref;
		}        

        function getObjectHash(obj) {

            var objString = JSON.stringify(obj, null, "");

            var hash = 0, i, chr;
            if (objString.length === 0) return hash;
            for (i = 0; i < objString.length; i++) {
              chr   = objString.charCodeAt(i);
              hash  = ((hash << 5) - hash) + chr;
              hash |= 0; // Convert to 32bit integer
            }
            return hash;
          };        
	}];