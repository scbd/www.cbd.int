define(['lodash', 'angular', 'filters/lstring', 'directives/print-smart/print-smart-checkout', './meeting-document', 'authentication',
        'css!./meeting-documents.css', 'angular-cache', 'services/conference-service'
], function(_, ng) {

    var CRP = /.*\/CRP(\d+)(?:$|\/[A-Z]+\d+$)/i
    var REV = /.*\/REV(\d+)$/i
    var ADD = /.*\/ADD(\d+)$/i

    return  ["$scope", "$route", "$http", '$q', '$location', 'authentication', 'conferenceService', '$filter', function(
              $scope,   $route,   $http,   $q,   $location,   authentication,   conferenceService,   $filter) {
        
        var $ctrl = this;
        var lstring  = $filter('lstring');

        $ctrl.documents = null;
        $ctrl.meetings  = null;
        $ctrl.toHtmlID  = toHtmlID;
        $ctrl.isEditor  = false;

        load();
        initAffix();

        //====================================
        // Init editor security
        //===================================
        $q.when(authentication.getUser()).then(function(user){
            $ctrl.isEditor = authentication.isInRole(user, ["EditorialService"]);
            $ctrl.edit = edit;
            $ctrl.add  = add;
        });

        //====================================
        //
        //====================================
        function load() {

            var conference = conferenceService.getActiveConference($route.current.params.code);
            var meetings;
            
            return $q.when(conference).then(function(c){
            
                conference = c;
            
            }).then(function(){

                var query, fields;

                var ids = _.map(conference.MajorEventIDs, function(id){
                    return { $oid: id };
                });

                // load meetings (no wait)

                query  = { _id: { $in : ids } };
                fields = { EVT_CD:1, agenda:1, printSmart:1 };

                meetings = $http.get("/api/v2016/meetings", { params: { q: query, f: fields } }).then(resData);

                // load documents

                var query = {
                    meeting: { $in : ids },
                    status:  'public',
                    type:    'in-session',
                    nature: { $in : ['non-paper', 'crp', 'limited'] }
                };

                return $http.get('/api/v2016/documents', { params: { q: query } }).then(resData);

            }).then(function(documents){
                
                $ctrl.tabs = _(documents).sortBy(buildSortKey).reduce(function(tabs, d){

                    d.metadata = _.defaults(d.metadata||{}, { //Normalize
                        printable: true,
                        visible : true
                    });                    

                    var tab = tabs[d.group||''] = tabs[d.group||''] || {
                        code: d.group||'plenary',
                        documents : []
                    };

                    tab.documents.push(d);

                    return tabs;

                }, {});

                var firstTab = _($ctrl.tabs).values().first();

                if(firstTab)
                    firstTab.loaded = true;

                $ctrl.documents = documents;

                //resolve meetings
                return meetings;

            }).then(function(meetings){

                var ids = _.map(meetings, '_id');

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

            t = `${t||''}`;

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

                if(psc.size()) {
                    psc.affix({ offset: { top:psc.offset().top - 10 } });
                    affixReady();
                }
            });
        }        
    }]

});
