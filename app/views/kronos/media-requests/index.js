import app from '~/app'
import _ from 'lodash'
import moment from 'moment'
import '~/services/kronos'
import '~/filters/term';
import '~/filters/moment';
import '~/directives/kronos/passport'
export { default as template } from './index.html'

    var KRONOS_MEDIA_TYPE = '0000000052000000cbd05ebe0000000b';

export default ['$http', 'kronos', '$q','$scope','$routeParams','$route','$location', '$filter' ,function($http, kronos, $q, $scope, $routeParams, $route, $location, $filter) {
        var _ctrl = this;

        _ctrl.requests              = [];
        _ctrl.sort                  = { prop: 'meta.createdOn', dir:'asc' };
        _ctrl.toggle                = toggle;
        _ctrl.selectRequest         = selectRequest;
        _ctrl.selectParticipant     = selectRequest;
        _ctrl.loadParticipants      = loadParticipants;
        _ctrl.attachmentUrl         = attachmentUrl
        _ctrl.selectedRequest       = null;
        _ctrl.selectedParticipant   = null;
        _ctrl.requestStatus = ''

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
        load();
        
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

                return LoadRequests().then(()=>LoadRequests('new'))     
            })
            .catch(function(err) {
                _ctrl.error = err.data || err;
            })
            .finally(()=>$scope.$applyAsync(()=>{_ctrl.requestStatus = 'new'; }))
        }

        function changeConference(conference){
            const { code } = $routeParams

            if(code) $route.updateParams({ code: conference.code });
            else     $location.path('/media-requests/'+conference.code)
        }


        async function LoadRequests(status, countOnly = false){

            if(_ctrl.requestStatus !== status) _ctrl.requestStatus = status;

            status = _ctrl.requestStatus || status;

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
                const { count } = mediaRequests;

                if(count && status !== 'error') return count;

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

                        _ctrl.requests = _ctrl.sort.dir==='desc'? _ctrl.requests.sort(compare).reverse() : _ctrl.requests.sort(compare);

                    })

            }).catch(function(err) {
                _ctrl.error   = err.data || err;
                _ctrl.loading = false;
            }).finally(() => { 

                    if(!$scope.counts) $scope.counts = {}
                    for (const request of _ctrl.requests)
                        if(!request.participants) continue;
                        else{
                            for (const participant of request.participants ) 
                                participant.showPassportForm = false;
                            request.contactsOnlyError = hasContactsOnlyError(request.participants) 
                            request.accreditationInProgress = request.accredited? isAccreditationInProgress(request) : false
                        }


                        if(_ctrl.requestStatus === '' || status === ''){
                            $scope.counts.error                   =  _ctrl.requests.filter(r => r.contactsOnlyError).length;  
                            $scope.counts.accreditationInProgress =  _ctrl.requests.filter(r => !r.contactsOnlyError && r.accreditationInProgress).length;  
                            $scope.counts.accredited =  _ctrl.requests.filter(r => !r.contactsOnlyError && !r.accreditationInProgress && r.accredited).length;  
                        }

                    if(_ctrl.requestStatus === 'error' || status === 'error'){
                        $scope.counts.accreditationInProgress =  _ctrl.requests.filter(r => !r.contactsOnlyError && r.accreditationInProgress  && r.accredited).length;  
                        $scope.counts.accredited =  _ctrl.requests.filter(r => !r.contactsOnlyError && !r.accreditationInProgress && r.accredited).length; 
                        _ctrl.requests = _ctrl.requests.filter(r => r.contactsOnlyError );
                        $scope.counts.error = _ctrl.requests.length
                    }
                    if(_ctrl.requestStatus === 'accreditationInProgress' || status === 'accreditationInProgress'){
                        $scope.counts.error                   =  _ctrl.requests.filter(r => r.contactsOnlyError).length;  
                        $scope.counts.accredited =  _ctrl.requests.filter(r => !r.contactsOnlyError && !r.accreditationInProgress && r.accredited).length;  
                        _ctrl.requests = _ctrl.requests.filter(r => !r.contactsOnlyError && r.accreditationInProgress && r.accredited );
                        $scope.counts.accreditationInProgress = _ctrl.requests.length
                    }
                    if(_ctrl.requestStatus === 'accredited' || status === 'accredited'){
                        $scope.counts.error                   =  _ctrl.requests.filter(r => r.contactsOnlyError).length;  
                        $scope.counts.accreditationInProgress =  _ctrl.requests.filter(r => !r.contactsOnlyError && r.accreditationInProgress).length;  

                        _ctrl.requests = _ctrl.requests.filter(r => !r.accreditationInProgress && !r.contactsOnlyError  && r.accredited); //accredited
                        $scope.counts.accredited = _ctrl.requests.length
                    }

                _ctrl.loading  = false;

            })
        }

        function isAccreditationInProgress(request){
            if(!request.accredited) return false;
            if(request.contactsOnlyError) return false;

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

            var qChain = $q.when(0);

            if(request     && request    !=prevRequest)     qChain = qChain.then(function() { return lookUpKronosOrganizations(request); });
            if(participant && participant!=prevParticipant) qChain = qChain.then(function() { return lookUpKronosContact(participant, request); });

            return qChain;
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
                org.isLinked = organizationIds.includes(org.organizationId)
                org.showMore = false
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
            const limit                         = 25;
            const hasKronosLinksAndNoSearchText = !searchText && contactId;
         
            const textQuery                     = { freeText, limit };
            const query                         = hasKronosLinksAndNoSearchText? { contactId } : textQuery 

            var _kronos = participant.kronos = participant.kronos || {};

            _kronos.search  = freeText;
            _kronos.loading = true;
            _kronos.error   = null;

            try{
                const { records } = await $http.get(kronos.baseUrl+'/api/v2018/contacts', { params: { q: query } }).then(resData)

                for (const contact of records){
                  contact.isLinked = contactId === contact.contactId;
                  contact.showMore = false
                }

                participant.kronos.contacts = records;

            }catch(err){
                _kronos.error = err.data || err;
            }finally{
                _kronos.loading = false;
                $scope.$digest()
            }
            
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
                    $scope.$applyAsync(()=>{
                    var index =  _.indexOf(request.organization.kronosIds, korg.organizationId)
                    request.organization.kronosIds.splice(index, 1);
                    korg.isLinked=false;
                    })
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
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }

        function removeKronosContact(request, participant, kcontact){
            
            return $http.delete('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + 
            '/participants/' + participant._id+ '/link-kronos/' + kcontact.contactId)
            .then(function(result){               
                if(result.status == 200){             
                    participant.kronosId = undefined;
                    participant.accredited = participant.isNominated = kcontact.isNominated = kcontact.isLinked = participant.rejected = false;
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })    
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

        async function queryPassports (q) {

            try{
                const data = await $http.get(`${kronos.baseUrl}/api/v2018/passports`, {params:{ q }});
                return data;
            }catch(error){
                return undefined;
            }
        }
	}]; 



   