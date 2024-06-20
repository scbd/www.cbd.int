import app from '~/app'
import _ from 'lodash'
import moment from 'moment'
import '~/services/kronos'
import '~/filters/term';

export { default as template } from './index.html'

    var KRONOS_MEDIA_TYPE = '0000000052000000cbd05ebe0000000b';

export default ['$http', 'user', 'kronos', '$q','$scope','$routeParams','$route','$location' ,function($http, user, kronos, $q, $scope, $routeParams, $route, $location) {
        var _ctrl = this;

        
        _ctrl.toggle                = toggle;
        _ctrl.selectRequest         = selectRequest;
        _ctrl.selectParticipant     = selectRequest;
        _ctrl.loadParticipants      = loadParticipants;
        _ctrl.attachmentUrl         = attachmentUrl
        _ctrl.selectedRequest       = null;
        _ctrl.selectedParticipant   = null;
        _ctrl.requestStatus = 'new'

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
                return LoadRequests()    
            }).catch(function(err) {

                _ctrl.error = err.data || err;

            })
        }

        function changeConference(conference){
            const { code } = $routeParams

            if(code) $route.updateParams({ code: conference.code });
            else     $location.path('/media-requests/'+conference.code)
        }


        function LoadRequests(status){

            status = status || _ctrl.requestStatus;

            var requestQuery = { 
                nominatingOrganization : { $exists: 1 },
                $or : [{conference : { $oid:_ctrl.conference._id }}, { conference : _ctrl.conference._id }]
            };


            if(status){

                requestQuery.currentStep = "finished";

                if(status == 'accredited')
                    requestQuery.accredited = true;
                else if(status == 'rejected')
                    requestQuery.rejected = true;
                else if(status == 'new'){
                    requestQuery.accredited = {$exists : false}
                    requestQuery.rejected   = {$exists : false}
                };
            }

            return $http.get('/api/v2018/kronos/participation-requests', { params: { q : requestQuery}})
            .then(resData)
            .then(function(mediaRequests) { 

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
                    .then(function(results) { 
                        var organizations = _(results).map('data').flatten().compact().value();

                        if(organizations && organizations.length >0){

                            _.map(organizations, function(organization){
                                var request = _.find(_ctrl.requests, function(r) {

                                    return (r.nominatingOrganization && r.nominatingOrganization == organization._id) 
                                        || (organization.requestId  &&  r._id                    == organization.requestId)

                                });
                                
                                if(request){
                                    request.organization = organization

                                    const createdDate = moment(request.meta.createdOn)
                                    const testDate    = moment('2022-08-22T13:00:00.000Z')
                                    const isBeforeTest = createdDate.isBefore(testDate)
                                    const isCop15     =  request.conference === '5f43fc3f16d297fb1d2b5292'

                                    if(isBeforeTest && isCop15)
                                        request.needTags = true
                                }
                            })
                        }

                    }) // TODO

            }).catch(function(err) {

                _ctrl.error   = err.data || err;
                _ctrl.loading = false
            }).finally(() => _ctrl.loading = false)
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
            
            if(request.participants) return;

            request.loadingParticipants = true;

            const requestId = request._id;
            const $oid      = requestId;
            const $or       = [ { requestId }, { requestId: { $oid } } ];
            const query     = { $or };

            try{
              const { data } = await $http.get('/api/v2018/kronos/participation-request/participants', { params: { q: query } });

              request.participants = data;
              
              for (const participant of request.participants ) {
                participant.needsVisa = (participant.tags || []).includes('visa')
                participant.isOnline = (participant.tags || []).includes('online')
              }

              for (const participant of request.participants)
                await selectRequest(request, participant)

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

              _kronos.organizations = records
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
            const organizationIds               = organization.kronosIds;
            const textQuery                     = organizationIds? { freeText, limit, organizationIds } : { freeText, limit }
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
                    if(!request.organization.kronosIds)
                        request.organization.kronosIds = [];
                    request.organization.kronosIds.push(korg.organizationId);
                    korg.isLinked=true;
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
                    var index =  _.indexOf(request.organization.kronosIds, korg.organizationId)
                    request.organization.kronosIds.splice(index, 1);
                    korg.isLinked=false;
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
	}]; 