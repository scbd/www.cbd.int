import app from '~/app'
import _ from 'lodash'
import moment from 'moment'
import '~/services/kronos'
import lookupTermText from '~/filters/term';
import '~/filters/moment';
import '~/directives/kronos/passport'
export { default as template } from './index.html'

    var KRONOS_MEDIA_TYPE = '0000000052000000cbd05ebe0000000b';
    var KRONOS_STATUS_ACCREDITED  = 2;
    const KRONOS_QUERY_CHUNK      = 25; // ids per lookup; an explicit limit is sent with each
    const KRONOS_TYPE_ID_WIDTH    = 32; // kronos echoes type ids unpadded; compare zero-padded to this width

export default ['$http', 'kronos', '$q','$scope','$routeParams','$route','$location', '$filter', '$timeout', '$window' ,function($http, kronos, $q, $scope, $routeParams, $route, $location, $filter, $timeout, $window) {
        var _ctrl = this;

        var SORT_PROPS = ['meta.createdOn', 'organization.title', 'meta.modifiedOn'];
        var SORT_DIRS  = ['asc', 'desc'];
        var STATUSES   = ['new', 'accredited', 'accreditationInProgress', 'rejected', 'draft', 'error'];

        // kronos records keyed by id, so the heading checks survive a status or sort change without
        // refetching. a miss is cached as null so a dangling link is not looked up again every reload,
        // and each link change drops the one id it touched.
        const kronosOrgTypes = {};
        const kronosContacts = {};

        // participants and passports keep loading after the list first paints, and each one that
        // lands above the target shifts it down - let the page settle before measuring its position
        const SCROLL_SETTLE_MS = 1500;

        var initialState     = stateFromSearch($location.search());
        var initialStatus    = initialState.status;
        var initialRequestId = initialState.request; // panel to re-open from the URL, consumed once
        var initialised      = false; // true once load() finishes; gates URL write-back
        var scrollTimer      = null;

        _ctrl.requests              = [];
        _ctrl.sort                  = initialState.sort;
        _ctrl.toggle                = toggle;
        _ctrl.selectRequest         = selectRequest;
        _ctrl.selectParticipant     = selectRequest;
        _ctrl.loadParticipants      = loadParticipants;
        _ctrl.attachmentUrl         = attachmentUrl
        _ctrl.selectedRequest       = null;
        _ctrl.selectedParticipant   = null;
        _ctrl.requestStatus    = ''
        _ctrl.search           = '';
        _ctrl.filteredRequests = [];

$scope.$watch(function(){
    return { search: _ctrl.search, requests: _ctrl.requests };
}, function(){
    _ctrl.filteredRequests = (_ctrl.requests || []).filter(matchesSearch);
}, true);

        _ctrl.linkKronsOrganization             = linkKronsOrganization;
        _ctrl.removeKronsOrganization           = removeKronsOrganization;
        _ctrl.linkKronosContact                 = linkKronosContact;
        _ctrl.removeKronosContact               = removeKronosContact;        
        _ctrl.updateOrganizationStatus          = updateOrganizationStatus; 
        _ctrl.updateParticipantStatus           = updateParticipantStatus;
        _ctrl.searchKronosOrg                   = searchKronosOrg;
        _ctrl.searchKronosContact               = searchKronosContact;
        _ctrl.lookUpKronosOrganizations         = lookUpKronosOrganizations;
        _ctrl.lookUpKronosContact               = lookUpKronosContact;
        
        _ctrl.createKronosOrg                   = createKronosOrg;  
        _ctrl.createKronosContact               = createKronosContact;  
        _ctrl.refreshRequestList                = LoadRequests;         
        _ctrl.loading                           = true;
        _ctrl.changeConference                  = changeConference;
        _ctrl.hasError                          = hasError;
        load();

        $scope.$on('$routeUpdate', function(){
            var state = stateFromSearch($location.search());

            var changed = state.status    !== _ctrl.requestStatus
                       || state.sort.prop !== _ctrl.sort.prop
                       || state.sort.dir  !== _ctrl.sort.dir;

            if(!changed) return;

            _ctrl.sort = state.sort;
            LoadRequests(state.status);
        });

        $scope.$on('$destroy', function(){ $timeout.cancel(scrollTimer); });
        
        //===================================
        //
        //===================================
        function load(addtionalReqQuery) {

            delete _ctrl.error;
            
            return $http.get('/api/v2016/conferences', { 
                params: {
                    f: { code:1, Title:1, MajorEventIDs:1, active:1, StartDate:1 }, 
                    q: { timezone: { $exists:true }, venueId: { $exists:true }, institution: 'CBD' },
                    s: { active: -1, StartDate:-1 } 
                }
            }).then(resData).then(function(conferences) {

                const { code } = $routeParams
                _ctrl.conferences = conferences;

                _ctrl.conference  = code? _.findWhere(conferences, { code }) : conferences[0];

                _ctrl.code        = code;

                return _ctrl.conference

            })
            .then(function(){
                return $http.get('/api/v2016/meetings', { 
                    params: {
                        f: { EVT_CD:1, title:1, _id:1}, 
                        q: { _id : { $in : _.map(_ctrl.conference.MajorEventIDs, function(evt){return { $oid: evt} })} }
                    }
                }).then(resData).then(function(meetings) {    
                    _ctrl.meetings = {}
                    _.each(meetings, function(meeting){
                        _ctrl.meetings[meeting._id] = meeting;
                    }); 

                });
            })
            .then(function(){
                loadCounts() 

                return LoadRequests().then(()=>LoadRequests(initialStatus))
            })
            .catch(function(err) {
                _ctrl.error = err.data || err;
            })
            .finally(()=>$scope.$applyAsync(()=>{
                _ctrl.requestStatus = initialStatus;
                initialised         = true;
                restoreExpandedRequest();
            }))
        }

        // re-open the panel named by ?request= once the list it lives in has loaded
        function restoreExpandedRequest(){
            const requestId = initialRequestId;

            initialRequestId = null; // one-shot: from here on the panel drives the URL, not the reverse

            if(!requestId) return;

            const request = _.find(_ctrl.requests, function(r){ return r._id === requestId; });

            if(!request) return; // filtered out by the current status, or gone

            selectRequest(request);

            const armedAt = $window.pageYOffset;

            scrollTimer = $timeout(function(){
                // the operator moved on while we waited - collapsed the panel, or scrolled
                // somewhere themselves. do not pull them back.
                if(_ctrl.selectedRequest !== request || $window.pageYOffset !== armedAt) return;

                const el = document.getElementById('media-request-' + requestId);

                if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, SCROLL_SETTLE_MS);
        }

        function stateFromSearch(search){
            var status = search.status === 'all'? '' : search.status;

            if(status !== '' && STATUSES.indexOf(status) === -1) status = 'new';

            return {
                status : status,
                request: search.request || null,
                sort   : {
                    prop: SORT_PROPS.indexOf(search.sortBy)  !== -1? search.sortBy  : 'meta.createdOn',
                    dir : SORT_DIRS .indexOf(search.sortDir) !== -1? search.sortDir : 'asc'
                }
            };
        }

        function matchesSearch(request){
            var text = (_ctrl.search || '').toLowerCase().trim();

            if(!text) return true;

            var org     = request.organization || {};
            var country = org.address && org.address.country;

            // resolved country label is sync once the term cache is primed (load() primes it); skip while pending
            var countryLabel = country? lookupTermText(country.toLowerCase()) : '';
            if(countryLabel && countryLabel.then) countryLabel = '';

            var fields = [ org.title, org.acronym, country, countryLabel ];

            (request.participants || []).forEach(function(p){
                fields.push(p.firstName, p.lastName, (p.firstName || '') + ' ' + (p.lastName || ''), p.email, p.emailCc);
            });

            return fields.some(function(v){ return (v || '').toLowerCase().indexOf(text) !== -1; });
        }

        function changeConference(conference){
            const { code } = $routeParams

            if(code) $route.updateParams({ code: conference.code });
            else     $location.path('/media-requests/'+conference.code)
        }


        async function LoadRequests(status, countOnly = false){

            if(!countOnly){
                if(_ctrl.requestStatus !== status) _ctrl.requestStatus = status;

                status = _ctrl.requestStatus || status;

                if(initialised){
                    $location.search('status',  status === ''? 'all' : (status === 'new'? null : status || null));
                    $location.search('sortBy',  _ctrl.sort.prop === 'meta.createdOn'? null : _ctrl.sort.prop);
                    $location.search('sortDir', _ctrl.sort.dir  === 'asc'?            null : _ctrl.sort.dir);
                }
            }

            var requestQuery = { 
                nominatingOrganization : { $exists: 1 },
                $or : [{conference : { $oid:_ctrl.conference._id }}, { conference : _ctrl.conference._id }]
            };

            requestQuery.currentStep = "finished";

            if(status){

                if(status == 'draft'){
                    requestQuery.currentStep = { $in: ['participants', 'organization', 'contacts','checklist'] };
                    requestQuery.accredited  = {$exists : false};
                    requestQuery.rejected    = {$exists : false};
                }else if(status == 'accredited' || status == 'accreditationInProgress')
                    requestQuery.accredited = true;
                else if(status == 'rejected')
                    requestQuery.rejected = true;
                else if(status == 'new' ){
                    requestQuery.accredited = {$exists : false};
                    requestQuery.rejected   = {$exists : false};
                    requestQuery.currentStep = "finished";
                }else if(status == 'error'){
                    requestQuery.rejected   = {$exists : false};
                    requestQuery.currentStep = "finished";
                }
            }else delete requestQuery.currentStep;

            const params = countOnly? { q : requestQuery, c : 1 } : { q : requestQuery };


            return $http.get('/api/v2018/kronos/participation-requests', { params })
            .then(resData)
            .then(function(mediaRequests) { 
                if(countOnly) return mediaRequests.count || 0;

                _ctrl.requests = mediaRequests;

                const mediaRequestQueries = []

                while(mediaRequests.length) {
                    const queryRequests = _.take(mediaRequests, 20);

                    mediaRequests = _.drop(mediaRequests, 20);

                    const requestIds = queryRequests.map((r) => ({ '$oid': r._id }))

                    const orgQuery = {
                        q : { $or : [{ requestId : {$in : requestIds} }, {requestId:{$exists:false}}] }
                    }

                    mediaRequestQueries.push($http.get('/api/v2018/kronos/participation-request/organizations', { params: orgQuery}));
                }

                

                return $q.all(mediaRequestQueries)
                    .then(async function(results) { 
                        await loadAllParticipants(_ctrl.requests);
                        var organizations = _(results).map('data').flatten().compact().value();

                        const terms = []

                        if(organizations && organizations.length >0){
                            
                            _.map(organizations, function(organization){

                                terms.push($filter('term')(organization.address.country.toLowerCase()))

                                const request = _.find(_ctrl.requests, function(r) {

                                    return (r.nominatingOrganization && r.nominatingOrganization == organization._id) 
                                        || (organization.requestId  &&  r._id                    == organization.requestId)

                                });
                                
                                if(request){
                                    request.organization = organization

                                    const createdDate  = moment(request.meta.createdOn)
                                    const testDate     = moment('2022-08-22T13:00:00.000Z')
                                    const isBeforeTest = createdDate.isBefore(testDate)
                                    const isCop15      =  request.conference === '5f43fc3f16d297fb1d2b5292'

                                    if(isBeforeTest && isCop15)
                                        request.needTags = true
                                    
                                }
                            })
                        }

                        if(_ctrl.requests?.length)
                            _ctrl.requests = _ctrl.sort.dir==='desc'? _ctrl.requests.sort(compare).reverse() : _ctrl.requests.sort(compare);

                        await flagLinkErrors(_ctrl.requests || []);

                    })

            }).catch(function(err) {
                _ctrl.error   = err.data || err;
                _ctrl.loading = false;
            }).finally(() => {

                    if(countOnly) return;

                    if(!$scope.counts) $scope.counts = {}
                    if(_ctrl.requests?.length){
                        for (const request of _ctrl.requests)
                            if(!request.participants) continue;
                            else{
                                for (const participant of request.participants ) 
                                    participant.showPassportForm = false;
                                request.contactsOnlyError = hasContactsOnlyError(request.participants) 
                                request.accreditationInProgress = request.accredited? isAccreditationInProgress(request) : false
                            }


                            if(_ctrl.requestStatus === '' || status === ''){
                                $scope.counts.error                   =  _ctrl.requests.filter(hasError).length;  
                                $scope.counts.accreditationInProgress =  _ctrl.requests.filter(r => !hasError(r) && r.accreditationInProgress).length;  
                                $scope.counts.accredited =  _ctrl.requests.filter(r => !hasError(r) && !r.accreditationInProgress && r.accredited).length;  
                            }

                        if(_ctrl.requestStatus === 'error' || status === 'error'){
                            $scope.counts.accreditationInProgress =  _ctrl.requests.filter(r => !hasError(r) && r.accreditationInProgress  && r.accredited).length;  
                            $scope.counts.accredited =  _ctrl.requests.filter(r => !hasError(r) && !r.accreditationInProgress && r.accredited).length; 
                            _ctrl.requests = _ctrl.requests.filter(hasError);
                            $scope.counts.error = _ctrl.requests.length
                        }
                        if(_ctrl.requestStatus === 'accreditationInProgress' || status === 'accreditationInProgress'){
                            $scope.counts.error                   =  _ctrl.requests.filter(hasError).length;  
                            $scope.counts.accredited =  _ctrl.requests.filter(r => !hasError(r) && !r.accreditationInProgress && r.accredited).length;  
                            _ctrl.requests = _ctrl.requests.filter(r => !hasError(r) && r.accreditationInProgress && r.accredited );
                            $scope.counts.accreditationInProgress = _ctrl.requests.length
                        }
                        if(_ctrl.requestStatus === 'accredited' || status === 'accredited'){
                            $scope.counts.error                   =  _ctrl.requests.filter(hasError).length;  
                            $scope.counts.accreditationInProgress =  _ctrl.requests.filter(r => !hasError(r) && r.accreditationInProgress).length;  

                            _ctrl.requests = _ctrl.requests.filter(r => !r.accreditationInProgress && !hasError(r)  && r.accredited); //accredited
                            $scope.counts.accredited = _ctrl.requests.length
                        }
                    }
                _ctrl.loading  = false;

            })
        }

        function isAccreditationInProgress(request){
            if(!request.accredited) return false;
            if(hasError(request)) return false;

            const participants = _.cloneDeep(request.participants||[]).filter(p => p?.meeting?.length);

            return !!participants.filter(p => (!p.accredited || !p.passport || !p.kronosId) && !p.rejected ).length
        }

        function compare( a, b ) {
            if ( _.get(a, _ctrl.sort.prop) < _.get(b, _ctrl.sort.prop))
                return -1;

            if ( _.get(a, _ctrl.sort.prop) > _.get(b, _ctrl.sort.prop) )
                return 1;

            return 0;
        }

        _ctrl.hasLinkedOrgs = hasLinkedOrgs;
        function hasLinkedOrgs(request){
            return request?.organization?.kronosIds?.length
        }

        async function loadAllParticipants(results){
            let requests = _.clone(results)
            const mediaRequestQueries = []

            while(requests.length) {
                const queryRequests = _.take(requests, 20);
                requests = _.drop(requests, 20);

                const requestIdsOids = queryRequests.map((r) => ({ '$oid': r._id }))
                const requestIds = queryRequests.map((r) =>  r._id )
                const params = {
                    q : { $or : [{ requestId : {$in : requestIds} }, {requestId:{$in : requestIdsOids}}] }
                }

                mediaRequestQueries.push($http.get('/api/v2018/kronos/participation-request/participants', { params}));
            }

            const participants = _(await Promise.all(mediaRequestQueries)).map('data').flatten().compact().value();

            const selectedRequests = [] ;

            const passportRequests = [];
            if(_ctrl.requests?.length){
                for (const r of _ctrl.requests) {
                    r.participants = participants.filter((p) => p.requestId === r._id)

                    for (const participant of r.participants ) {
                        participant.showPassportForm = false;
                        const { conference:conferenceId, nominatingOrganization:organizationId } = r;
                        const { kronosId } = participant;

                        if(!kronosId || !conferenceId || !organizationId) continue;

                        passportRequests.push(queryPassports({ contactIds: [kronosId], conferenceId })
                        .then(({ data }) => {  participant.passport = data?.records[0] } ))
                    }
                }
            }
            return Promise.allSettled( passportRequests)
        }
        async function loadCounts(){

            const requests = [ LoadRequests('new', true), LoadRequests('accredited', true), LoadRequests('rejected', true), LoadRequests('', true), LoadRequests('draft', true), ]

            const [newRequests, accredited, rejected, total, draft ] = await Promise.all(requests)

            $scope.counts= {...($scope.counts || {}), newRequests,accredited, rejected, total, draft }

            return $scope.counts
        }


        function hasContactsOnlyError(participants =[]){
            return !participants.filter(p => p?.meeting?.length).length
        }

        // one definition of "in error state", shared by the error filter, its count and the red
        // heading. it covers the two link faults resolved for the whole list up front. a contact
        // whose kronos registration disagrees with this request (registrationMismatch) reddens its
        // own row once the panel is open, but is not resolved list-wide and so is not counted here,
        // and neither is a link pointing at a record kronos no longer has.
        function hasError(request){
            return !!(request.contactsOnlyError || request.orgLinkError || request.contactLinkError);
        }

        // a panel heading has to show a link problem without being opened, so the checks the expanded
        // view runs per organization and per contact are resolved once, for the whole list, up front
        async function flagLinkErrors(requests){
            try{
                const orgIds     = collectIds(requests, function(r){ return r.organization?.kronosIds; });
                const contactIds = collectIds(requests, function(r){ return (r.participants || []).map(function(p){ return p.kronosId; }); });

                await Promise.all([ cacheOrganizationTypes(orgIds), cacheContacts(contactIds) ]);

                for (const request of requests){
                    const linkedOrgIds = request.organization?.kronosIds || [];

                    request.orgLinkError     = linkedOrgIds.some(function(id){ return isKnownNonMediaType(kronosOrgTypes[id]); });
                    request.contactLinkError = (request.participants || []).some(function(participant){
                        const contact = participant.kronosId && kronosContacts[participant.kronosId];

                        if(!contact) return false;

                        return isKnownNonMediaType(contact.organization?.organizationTypeId)
                            || (!!linkedOrgIds.length && !linkedOrgIds.includes(contactOrganizationId(contact)));
                    });
                }
            }catch(err){
                // a heading hint is not worth failing the list over - the expanded view still flags it
                console.error('could not resolve kronos link errors', err && err.status, err && err.data);
            }
        }

        function collectIds(requests, pick){
            return _.uniq(_.compact(_.flatten(requests.map(pick))));
        }

        function chunkIds(ids){
            const chunks = [];

            for (let i = 0; i < ids.length; i += KRONOS_QUERY_CHUNK) chunks.push(ids.slice(i, i + KRONOS_QUERY_CHUNK));

            return chunks;
        }

        async function cacheOrganizationTypes(organizationIds){
            const missing = organizationIds.filter(function(id){ return !(id in kronosOrgTypes); });

            await Promise.all(chunkIds(missing).map(async function(chunk){
                const records = await $http.get(kronos.baseUrl+'/api/v2018/organizations', { params: { q: { organizationIds: chunk }, limit: chunk.length } })
                                          .then(resData).then(function(r){ return r.records || []; });

                if(!isScopedToChunk(records, chunk, 'organizationId', 'organizations')) return;

                for (const id  of chunk  ) kronosOrgTypes[id]                  = null;
                for (const org of records) kronosOrgTypes[org.organizationId]  = org.organizationTypeId;
            }));
        }

        async function cacheContacts(contactIds){
            const missing = contactIds.filter(function(id){ return !(id in kronosContacts); });

            await Promise.all(chunkIds(missing).map(async function(chunk){
                const records = await $http.post(kronos.baseUrl+'/api/v2018/contacts/query', { contactIds: chunk, limit: chunk.length, skip: 0 })
                                          .then(resData).then(function(r){ return r.records || []; });

                if(!isScopedToChunk(records, chunk, 'contactId', 'contacts')) return;

                for (const id      of chunk  ) kronosContacts[id]                 = null;
                for (const contact of records) kronosContacts[contact.contactId]  = contact;
            }));
        }

        // these lookups filter by a list of ids. if an endpoint were to ignore that filter it would
        // answer with arbitrary records instead, and caching them would quietly mis-report every
        // heading. the id field has to be named by the caller: a kronos contact record carries an
        // organizationId of its own, so guessing between the two would reject every contact page.
        function isScopedToChunk(records, chunk, idField, what){
            const asked  = new Set(chunk);
            const scoped = records.every(function(r){ return asked.has(r[idField]); });

            if(!scoped) console.error('kronos ' + what + ' lookup ignored its id filter; not caching');

            return scoped;
        }

        //===================================
        //
        //===================================
        function selectRequest(request, participant) {
            var prevRequest     = _ctrl.selectedRequest;
            var prevParticipant = _ctrl.selectedParticipant;

            request     = request     || null;
            participant = participant || null;

            _ctrl.selectedRequest       = request;
            _ctrl.selectedParticipant   = participant;

            // keep the open panel in the URL so the view can be linked and restored
            if(initialised) $location.search('request', request? request._id : null);

            var qChain = $q.when(0);

            if(request     && request    !=prevRequest)     qChain = qChain.then(function() { return lookUpKronosOrganizations(request); });
            if(participant && participant!=prevParticipant) qChain = qChain.then(function() { return lookUpKronosContact(participant, request); });

            return qChain;
        }

        // target="_blank" alone is ignored by the embedded browsers this admin screen gets opened
        // in, so the new tab is opened explicitly. the href stays on the anchor for middle click and
        // copy-link, and the default is only cancelled once the tab is real.
        _ctrl.openInKronos = openInKronos;
        function openInKronos($event){
            $event.stopPropagation();

            // a modifier click belongs to the browser - cmd/ctrl/shift/alt keep their own meaning
            if($event.metaKey || $event.ctrlKey || $event.shiftKey || $event.altKey) return;

            const url = $event.currentTarget && $event.currentTarget.href;

            if(!url) return;

            const opened = $window.open(url, '_blank', 'noopener,noreferrer');

            // a blocked open would otherwise leave a dead control; falling through lets the
            // anchor's own href do what it can
            if(opened) $event.preventDefault();
        }

        //===================================
        //
        //===================================
        function attachmentUrl(url){
            if(!url)return''
            if(~url.indexOf('cbd.documents.temporary'))
                return url
            return '/participation/download/'+encodeURIComponent(url).replace(/%2f/gi, '/');

        }
        
        //===================================
        //
        //===================================
        async function loadParticipants(request){
            request.showParticipants = !request.showParticipants;
            

            if(request.participants){
                for (const participant of request.participants ) {
                    if(!participant?.kronos) participant.kronos = {}
                    
                    _ctrl.searchKronosContact(participant.kronos.search, participant, request)
                }
                
                return;
            }
            request.loadingParticipants = true;

            const requestId = request._id;
            const $oid      = requestId;
            const $or       = [ { requestId }, { requestId: { $oid } } ];
            const query     = { $or };

            try{
              const { data } = await $http.get('/api/v2018/kronos/participation-request/participants', { params: { q: query } });

              request.participants = data;
              
              for (const participant of request.participants ) {
                participant.showPassportForm=false;
                participant.needsVisa = (participant.tags || []).includes('visa')
                participant.isOnline = (participant.tags || []).includes('online')
              }

              const selectedRequests = [] ;
              for (const participant of request.participants)
                selectedRequests.push(selectRequest(request, participant));

              await Promise.all(selectedRequests)

            }catch(err){
              console.error(err)
            }
            finally{
              request.loadingParticipants = false;

              $scope.$digest()
            }
            
        }

        ///////////////////////////////////////////
        ///////////////KRONOS//////////////////////
        ///////////////////////////////////////////

        //===================================
        //
        //===================================
        async function lookUpKronosOrganizations(request = _ctrl.selectedRequest, searchText) {

            if(!request) return;

            const { organization }  = request;
            const   organizationIds = organization?.kronosIds || [];
            const   freeText        = searchText || organization.title || '';
            const   typeIds         = [ KRONOS_MEDIA_TYPE ]

            const hasKronosLinksAndNoSearchText = !searchText &&  organizationIds.length

            const query = hasKronosLinksAndNoSearchText? { organizationIds } : { typeIds, freeText }


            var _kronos = request.kronos = request.kronos || {};

            _kronos.search  = freeText;
            _kronos.loading = true;
            _kronos.error   = null;

            try{
              const { records }  = await $http.get(kronos.baseUrl+'/api/v2018/organizations', { params: { q: query } }).then(resData)

              for (const org of records){
                org.isLinked        = organizationIds.includes(org.organizationId)
                org.showMore        = false
                org.notMediaOrgType = isKnownNonMediaType(org.organizationTypeId)
              }

              _kronos.organizations = records.length? records.slice(0,8) : records
            } catch(err){
              _kronos.error = err.data || err;
            }
            finally{
              _kronos.loading = false;
              $scope.$digest()
            }
        }

        //===================================
        //
        //===================================
        async function lookUpKronosContact(participant = _ctrl.selectedParticipant, { organization }, searchText) {

            if(!participant) return;

            const { kronosId: contactId, firstName, lastName } = participant;

            const freeText                      = searchText || `${firstName || ''} ${lastName || ''}` || '';
            const organizationIds               = organization?.kronosIds || [];
            const eventIds                      = participant.meeting || [];
            const hasKronosLinksAndNoSearchText = !searchText && contactId;

            var _kronos = participant.kronos = participant.kronos || {};

            _kronos.search  = freeText;
            _kronos.error   = null;

            // returns before the first await, so $digest() in the finally below would run
            // inside the caller's digest - use $applyAsync instead of entering the try
            if(!hasKronosLinksAndNoSearchText && !organizationIds.length){
                _kronos.contacts = [];
                _kronos.loading  = false;
                _kronos.error    = 'Organization must be linked with kronos before contacts can be searched.';
                return $scope.$applyAsync();
            }

            _kronos.loading = true;

            try{
                // the linked-contact lookup is deliberately scoped by neither organizationIds nor
                // organizationTypeIds: a contact sitting under another organization - or under one
                // kronos does not type as media - still has to come back, otherwise the link is
                // invisible here and can be neither unlinked nor corrected. the notInLinkedOrg and
                // notMediaOrgType flags surface those two cases instead of hiding the row.
                // only the free-text search stays scoped to media organizations.
                const query = hasKronosLinksAndNoSearchText
                    ? { contactId }
                    : { freeText, organizationIds, organizationTypeIds: [ KRONOS_MEDIA_TYPE ] };

                const { records } = await $http.post(kronos.baseUrl+'/api/v2018/contacts/query', {
                    ...query,
                    registrationStatusForEventIds: eventIds,
                    limit                        : 25,
                    skip                         : 0
                  }).then(resData)

                for (const contact of records){
                  // read the participant's link as it stands now, not as it was when this lookup
                  // started: an unlink resolving mid-flight would otherwise be painted as linked
                  contact.isLinked        = !!participant.kronosId && participant.kronosId === contact.contactId;
                  contact.showMore        = false
                  // identity, not type: is this contact filed under the same kronos organization
                  // record the request is linked to. the media type is checked separately below,
                  // because a contact can sit in the wrong record and a correctly typed one at once
                  contact.notInLinkedOrg  = !!organizationIds.length && !organizationIds.includes(contactOrganizationId(contact));
                  contact.notMediaOrgType = isKnownNonMediaType(contact.organization?.organizationTypeId);
                  contact.registrationMismatch = contact.isLinked && !!eventIds.length &&
                                                 isAccreditedForAllEvents(contact, eventIds) !== !!participant.accredited;
                }

                participant.kronos.contacts = records;

            }catch(err){
                _kronos.error = err.data || err;
            }finally{
                _kronos.loading = false;
                $scope.$digest()
            }
            
        }

        function contactOrganizationId(contact){
            return contact.organizationId || contact.organization?.organizationId || contact.organization?._id;
        }

        // the linked lookups are unscoped by type, so they can return a record whose organization
        // kronos does not type as media - the reason a link like that was invisible here before.
        // kronos echoes the type id unpadded, so pad both sides and compare the whole value.
        function normalizeTypeId(typeId){
            return String(typeId).trim().toLowerCase().padStart(KRONOS_TYPE_ID_WIDTH, '0');
        }

        function isKnownNonMediaType(typeId){
            if(!typeId) return false; // kronos not telling us the type is not evidence of a problem

            const normalized = normalizeTypeId(typeId);

            // only an id we recognise as a kronos type can be judged. anything else - a different id
            // format, a truncated value - would otherwise normalise to "not the media type" and
            // accuse a perfectly good media organization, so leave it unflagged too.
            if(!/^[0-9a-f]{32}$/.test(normalized)) return false;

            return normalized !== normalizeTypeId(KRONOS_MEDIA_TYPE);
        }

        // kronos registration status: 1 = nominated, 2 = accredited
        function isAccreditedForAllEvents(contact, eventIds){
            const registrations = (contact.registrationStatuses || []).filter(Boolean);

            return eventIds.every(eventId => registrations.some(r => r.eventId === eventId && r.status === KRONOS_STATUS_ACCREDITED));
        }

        function updateOrganizationStatus(request, status){
            
            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/' + status)
            .then(function(result){ 
                if(result.status == 200){              

                    request             .accredited = status == 'accreditate';
                    request.organization.accredited = status == 'accreditate';
                    request             .rejected   = status == 'reject';
                    request.organization.rejected   = status == 'reject';
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }
       _ctrl.sendBack =sendBack;
        function sendBack(request){
            
            return $http.get('/api/v2018/kronos/participation-requests/'+request._id )
            .then(function(result){ 
                delete result.data.meta;
                result.data.currentStep = 'participants';
                $http.put('/api/v2018/kronos/participation-requests/'+request._id, result.data )
                .then((r)=>console.log(r)).catch(function(err) {
                    console.log(err)
                 })
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }
        function updateParticipantStatus(participant, request, status){
            
            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + 
            '/participants/' + participant._id + '/' + status)            
            .then(function(result){ 
                if(result.status == 200){              
                    if(status == 'accreditate'){
                        participant.accredited = true;
                        delete participant.rejected;
                    }
                    else {
                        delete participant.accredited;
                        participant.rejected = true;
                    }
                }
            }).catch(function(err) {
               console.log(err)
            //    TODO: Delete linking
            }).finally(function(){
                // delete _kronos.loading;
            })
        }
        

        function linkKronsOrganization(request, korg){

            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/link-kronos/' + korg.organizationId,)
            .then(function(result){               
                if(result.status == 200){  
                    $scope.$applyAsync(()=>{
                        if(!request.organization.kronosIds)
                            request.organization.kronosIds = [];
                        request.organization.kronosIds.push(korg.organizationId);
                        korg.isLinked=true;

                        delete kronosOrgTypes[korg.organizationId]; // stale now; re-read on the next load
                    })                 

                }
            }).catch(function(err) {
                console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }

        function removeKronsOrganization(request, korg){
            
            return $http.delete('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/link-kronos/' + korg.organizationId,)
            .then(function(result){               
                if(result.status == 200){
                    // this already runs inside the $http digest, so drop the link synchronously:
                    // deferring the splice to $applyAsync leaves the refresh below reading the old ids
                    const index = _.indexOf(request.organization.kronosIds, korg.organizationId);

                    if(index !== -1) request.organization.kronosIds.splice(index, 1);

                    korg.isLinked = false;

                    delete kronosOrgTypes[korg.organizationId]; // stale now; re-read on the next load

                    // while an organization is linked it is fetched by id, whatever type kronos gives
                    // it, so the link stays visible and correctable. once unlinked the list has to go
                    // back to the media only search, or the unlinked organization sits in the results
                    // looking like a match for a search that would never have returned it
                    return lookUpKronosOrganizations(request);
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })    
        }

        function linkKronosContact(request, participant, kcontact){

            //link KRONOS contact with Media request particiapnt
            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + 
            '/participants/' + participant._id+ '/link-kronos/' + kcontact.contactId)            
            .then(function(result){    
                console.log(result)           
                if(result.status == 200){
                    _.map(participant.kronos.contacts, function(con){con.isLinked=false;})                    
                    participant.kronosId = kcontact.contactId;
                    kcontact.isLinked = participant.isNominated = kcontact.isNominated = true;

                    delete kronosContacts[kcontact.contactId]; // stale now; re-read on the next load

                    return refreshParticipantPassport(participant, request);
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }

        function removeKronosContact(request, participant, kcontact){

            const _kronos = participant.kronos = participant.kronos || {};

            _kronos.error = null;

            return $http.delete('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id +
            '/participants/' + participant._id+ '/link-kronos/' + kcontact.contactId)
            .then(function(result){
                if(result.status == 200){
                    participant.kronosId = undefined;
                    participant.accredited = participant.isNominated = kcontact.isNominated = kcontact.isLinked = participant.rejected = false;

                    delete kronosContacts[kcontact.contactId]; // stale now; re-read on the next load

                    return refreshParticipantPassport(participant, request);
                }
            }).catch(function(err) {
                console.error('unlink failed', err && err.status, err && err.data);

                return describeUnlinkFailure(err, participant, kcontact)
                    .then(function(reason){ $scope.$applyAsync(function(){ _kronos.error = reason; }); });
            })
        }

        // the unlink endpoint removes the kronos accreditation inside the same call, so it fails
        // outright when that registration has already been removed in kronos - the common way this
        // refuses - and the click then looks like it simply did nothing. name the cause instead.
        async function describeUnlinkFailure(err, participant, kcontact){
            // the server's own words win whenever it has any. the probe below exists only for the
            // empty-bodied 500 this endpoint returns when it cannot remove the kronos accreditation,
            // and must not put that explanation on a rejection that said something else.
            const served = err?.data?.message || (typeof err?.data === 'string' ? err.data : '');

            if(served) return served;

            const generic  = 'Could not unlink this contact. Please try again.';
            const eventIds = participant.meeting || [];

            if(!participant.accredited || !eventIds.length) return generic;

            try{
                const { records } = await $http.post(kronos.baseUrl+'/api/v2018/contacts/query', {
                    contactId                    : kcontact.contactId,
                    registrationStatusForEventIds: eventIds,
                    limit                        : 1,
                    skip                         : 0
                  }).then(resData);

                const registrations = (records?.[0]?.registrationStatuses || []).filter(Boolean);

                if(registrations.length < eventIds.length)
                    return 'Still accredited here, but Kronos no longer holds a registration for every '
                         + 'meeting on this request, so the accreditation cannot be removed and the '
                         + 'unlink is refused. Restore the Kronos registration, or have the '
                         + 'accreditation cleared here first, then unlink.';
            }catch(probeErr){
                console.error('could not read the kronos registration', probeErr && probeErr.status, probeErr && probeErr.data);
            }

            return generic;
        }
        
        function createKronosOrg(request){

            var organization = request.organization;
            var kronosOrg = {
                name                    : organization.title,
                acronym                 : organization.acronym,
                organizationTypeId      : KRONOS_MEDIA_TYPE,
                address                 : (organization.address.unitNumber||'') + '' + (organization.address.streetNumber||'') + '' +(organization.address.street||''),
                city                    : organization.address.locality,
                state                   : organization.address.administrativeArea,
                country                 : organization.address.country? organization.address.country.toLowerCase() : '',
                postalCode              : organization.address.postalCode,
                phones                  : _.compact([organization.phone]),
                emails                  : _.compact([organization.email]),
                emailCcs                : _.compact([organization.emailCc]),
                webs                    : _.compact([organization.website])

            }
            request.creatingKronosOrg = true;
            return $http.post(kronos.baseUrl+'/api/v2018/organizations', kronosOrg)
            .then(function(result){               
                if(result.status == 200){                    
                    if(!organization.kronosIds)
                        organization.kronosIds = [];
                    organization.kronosIds.push(result.data.organizationId);

                    return linkKronsOrganization(request, result.data).then(function(data){
                            if((request.kronos.organizations||[]).length)
                            request.kronos.organizations.push(result.data);
                        else
                            request.kronos.organizations = [result.data];
                    })
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                delete request.creatingKronosOrg;
            })

        }
        
        function createKronosContact(participant, request){

            if((request.organization.kronosIds||[]).length == 0){
               return;
            }

            var organizationId;
            
            if(request.organization.kronosIds.length == 1)
                organizationId = request.organization.kronosIds[0];
            else{
                //show dialog?
                organizationId = request.organization.kronosIds[0];
            }
            var kronosContact = {
                organizationId,
                organizationTypeId        : KRONOS_MEDIA_TYPE,
                title                      : participant.title,
                firstName                  : participant.firstName,
                lastName                   : participant.lastName,
                designation                : participant.designation,
                department                 : participant.department,
                affiliation                : participant.affiliation,
                language                   : participant.language,
                phones                     : _.compact([participant.phones, participant.phoneDuringMeeting]),
                mobiles                    : _.compact([participant.mobile]),
                emails                     : _.compact([participant.email]),
                emailCcs                   : _.compact([participant.emailCc]),
                dateOfBirth                : participant.dateOfBirth ? moment(participant.dateOfBirth).toDate() : null, // TO FIX DATES IN ASP.NET
                country                    : participant.nationality? participant.nationality.toLowerCase() : '',
                useOrganizationAddress     : participant.useOrganizationAddress
            };

            if(!participant.useOrganizationAddress){                
                kronosContact.address    = (participant.address.unitNumber||'') + '' + (participant.address.streetNumber||'') + '' + (participant.address.street||'');
                kronosContact.city       = participant.address.locality;
                kronosContact.state      = participant.address.administrativeArea;
                kronosContact.country    = participant.address.country? participant.address.country.toLowerCase(): '';
                kronosContact.postalCode = participant.address.postalCode;
            }

            participant.creatingKronosContact = true;
            return $http.post(kronos.baseUrl+'/api/v2018/organizations/'+organizationId+'/contacts', kronosContact)
            .then(function(result){               
                if(result.status == 200){   
                    participant.kronosId = result.data.contactId;
                    return linkKronosContact(request, participant, result.data).then(function(data){
                        console.log('linked', data)
                        if((participant.kronos.contacts||[]).length)
                            participant.kronos.contacts.push(result.data)
                        else
                            participant.kronos.contacts = [result.data];
                    })
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                delete request.creatingKronosContact;
            })
        }

        function searchKronosOrg(search, request){
            return $scope.$applyAsync(()=> lookUpKronosOrganizations(request, search))
        }

        function searchKronosContact(search, participant, request){
            return $scope.$applyAsync(()=> lookUpKronosContact(participant, request, search))
        }
        
        function toggle(obj){
          obj.showMore = !obj.showMore
        }

        //===================================
        //
        //===================================
        function resData(res) {  return res.data; }

        // the passport badge is read from kronos for whichever contact the participant is linked to,
        // so it has to be re-read whenever that link changes. left alone, the previous contact's
        // passport is still reported against the new one, which hides the form for adding a passport
        // and leaves the participant unprocessable until the screen is reloaded.
        async function refreshParticipantPassport(participant, request){

            const conferenceId = request?.conference;
            const contactId    = participant.kronosId;

            if(!contactId || !conferenceId){
                participant.passport = undefined;

                return $scope.$applyAsync();
            }

            const passports = await queryPassports({ contactIds: [ contactId ], conferenceId });

            // the link moved on while this was in flight; whatever came back describes the old contact
            if(participant.kronosId !== contactId) return;

            // queryPassports answers undefined for a failed read, which is not the same as holding no
            // passport. assigning it would offer the add-passport form for a contact that already has
            // one, and invite a duplicate in kronos, so say the read failed instead.
            if(passports) participant.passport = passports.data?.records?.[0];
            else (participant.kronos = participant.kronos || {}).error =
                'Could not re-read the passport for this contact. Reload to confirm before adding one.';

            return $scope.$applyAsync();
        }

        async function queryPassports (q) {

            try{
                const data = await $http.get(`${kronos.baseUrl}/api/v2018/passports`, {params:{ q }});
                return data;
            }catch(error){
                return undefined;
            }
        }
	}]; 



   