import '~/filters/lstring'
import '~/directives/print-smart/print-smart-checkout'
import './meeting-document'
import '~/authentication'
import 'angular-cache'
import '~/services/conference-service'
import _  from 'lodash'
import ng from 'angular'
import { normalizeMeeting } from '~/services/meetings';
import AgendaItem from '~/components/meetings/sessions/agenda-item.vue'

export { default as template }  from './in-session-documents.html'

var CRP = /.*\/CRP(\d+)(?:$|\/[A-Z]+\d+$)/i
var REV = /.*\/REV(\d+)$/i
var ADD = /.*\/ADD(\d+)$/i
var STATISTICS = {}; 

export default ["$scope", "$route", "$http", '$q', '$location', 'authentication', 'conferenceService', '$filter', 'CacheFactory', function(
              $scope,   $route,   $http,   $q,   $location,   authentication,   conferenceService,   $filter,   CacheFactory) {
        
        var $ctrl = $scope.$ctrl = this;
        var lstring  = $filter('lstring');
        var conferenceCode = $route.current.params.code;
        var httpCache = initCache();

        $ctrl.documents = null;
        $ctrl.meetings  = null;
        $ctrl.toHtmlID  = toHtmlID;
        $ctrl.edit = edit;
        $ctrl.add  = add;

        $scope.vueOptions = { components: { AgendaItem } };

        load();
        initAffix();

        //====================================
        // Init editor security
        //===================================
        $q.when(authentication.getUser()).then(function(user){
            $ctrl.isEditor = authentication.isInRole(user, ["EditorialService"]);
            $ctrl.isStaff  = authentication.isInRole(user, ["ScbdStaff"]) || $ctrl.isEditor;
        });

        //====================================
        //
        //====================================
        function load() {

            return $q.when(httpCache.reValidate()).then(function(){

                return conferenceService.getActiveConference(conferenceCode);

            }).then(async function(conference){
            
                var query, fields;
                let meetingIds = conference.MajorEventIDs;
                //Temp for COP15
                meetingIds = meetingIds.filter(e=>e!='52000000cbd0495c00001876');

                var ids = _.map(meetingIds, function(id){
                    return { $oid: id };
                });

                // load meetings (no wait)

                query  = { _id: { $in : ids } };
                fields = { EVT_CD:1, agenda:1, printSmart:1 };

                const qMeetings = $http.get("/api/v2016/meetings", { params: { q: query, f: fields, cache:true } }).then(resData).then(meetings=>meetings.map(normalizeMeeting));

                // load documents

                query = {
                    meeting: { $in : ids },
                    status:  'public',
                    type:    'in-session',
                    nature: { $in : ['non-paper', 'crp', 'limited'] }
                };

                const qDocuments = $http.get('/api/v2016/documents', { params: { q: query, cache:!$ctrl.isEditor }, cache: httpCache }).then(resData);

                const meetings = await qMeetings;
                const documents = await qDocuments;

                var tabs = _(documents).sortBy(buildSortKey).reduce(function(tabs, d){

                    d.agendaItems = (d.agendaItems||[]).map(i=>{
                        const meeting = meetings.find(m=>m._id == d.meeting);
                        return meeting?.agenda?.items?.find(({item}) => item == i) || { item: i };
                    })

                    d.metadata = _.defaults(d.metadata||{}, { //Normalize
                        printable: true,
                        visible : true
                    });                    

                    var tab = tabs[d.group||''] = tabs[d.group||''] || {
                        code: d.group||'plenary',
                        documents : []
                    };

                    tab.sortKey = (d.group||'').toUpperCase();

                    tab.documents.push(d);

                    return tabs;

                }, {});

                $ctrl.tabs = _(tabs).values().sortBy('sortKey').value();
                $ctrl.currentTab = _.first($ctrl.tabs);

                if($ctrl.currentTab)
                    $ctrl.currentTab.loaded = true;


                var ids = _.map(meetings, '_id');

                $ctrl.documents  = documents;
                $ctrl.meetings   = _.zipObject(ids, meetings);
                $ctrl.printSmart = _.some(meetings, {printSmart:true});
                
            }).catch(console.error)
        }

        //====================================
        //
        //====================================
        function edit(document) {

            var meeting = $ctrl.meetings[document.meeting];

            var parts = [
                $route.current.params.code,
                meeting.EVT_CD,
                'documents',
                document._id
            ];

            $location.path('/'+_.map(parts, encodeURIComponent).join('/'));
        }

        //====================================
        //
        //====================================
        function add(meeting) {

            var parts = [
                $route.current.params.code,
                meeting.EVT_CD,
                'documents',
                'new'
            ];

            $location.path('/'+_.map(parts, encodeURIComponent).join('/'));
        }

        //====================================
        //
        //====================================
        function buildSortKey(d) {

            var sortKey = [];

            if((d.metadata||{}).superseded) sortKey.push("B");
            else                            sortKey.push("A");

                 if(d.nature=="limited")    sortKey.push("A");
            else if(d.nature=="crp")        sortKey.push("B");
            else if(d.nature=="non-paper")  sortKey.push("C");
            else                            sortKey.push("Z");

            var normalizedSymbol = (d.symbol || 'ZZZ').replace(/\d+/g, pad);

            if(d.nature=="limited") {
                sortKey.push(pad("0")) //TODO: Meeting index
                sortKey.push(normalizedSymbol)
            }
            else {

                var crp = parseInt(getNumber(normalizedSymbol, CRP) || 9999);
                var rev = parseInt(getNumber(normalizedSymbol, REV) ||    0);
                var add = parseInt(getNumber(normalizedSymbol, ADD) ||    0);

                sortKey.push(pad(crp));
                sortKey.push(pad(9999-rev));
                sortKey.push(pad(add));
            }

            sortKey.push((normalizedSymbol || lstring(d.title)).toUpperCase());

            return sortKey.join('-')
        }
        
        function getNumber(symbol, re) {

            if(re.test(symbol)) 
                return symbol.replace(re, "$1");

            return "";
        }

        //====================================
        //
        //====================================
        function pad(t) {

            t = (t||'').toString();

            while(t.length<4)
                t = '0'+t;

            return t;
        }

        //====================================
        //
        //====================================
        function toHtmlID(text) {
            return (text||'').replace(/[^A-Z0-9]/gi, '_');  
        }

        //====================================
        //
        //====================================
        function resData(res) { return res.data; }

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

        //==============================
        //
        //==============================
        function initCache() {

            var cacheId = 'meeting_documents_insession_'+conferenceCode;
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

                    return conferenceService.getActiveConference(conferenceCode).then(function(conference) {

                        var reqs = _.map(conference.MajorEventIDs, function(id){
                            return $http.get('/api/v2016/meetings/'+encodeURIComponent(id)+'/documents/statistics').then(resData);
                        });

                        return $q.all(reqs);
                        
                    }).then(function(stats){

                        var oldStats = STATISTICS[conferenceCode] || thisCache.get('statistics');
                        var newStats = stats;

                        if(!_.isEqual(oldStats, newStats)) {
                            thisCache.removeAll();
                            thisCache.put('statistics', newStats);
                            STATISTICS[conferenceCode]= newStats;
                        }

                        return thisCache;

                    }).catch(function(e){

                        thisCache.removeAll();
                        return thisCache;
                    });
                };
            }

            return cache;
        }
    }];
