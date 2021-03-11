import app from 'app'
import _ from 'lodash'
import moment from 'moment'
import '~/services/kronos'
import '~/filters/term';

export { default as template } from './index.html'

    var KRONOS_MEDIA_TYPE = '0000000052000000cbd05ebe0000000b';

export default ['$http', 'user', 'kronos', '$q', function($http, user, kronos, $q) {
        var _ctrl = this;

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
        
        load();
        
        //===================================
        //
        //===================================
        function load(addtionalReqQuery) {

            delete _ctrl.error;
            
            return $http.get('/api/v2016/conferences', { 
                params: {
                    f: { code:1, Title:1, MajorEventIDs:1, active:1,StartDate:1 }, 
                    q: { timezone: { $exists:true }, venueId: { $exists:true } },
                    s: { StartDate:-1 } 
                }
            }).then(resData).then(function(conferences) {

                _ctrl.conferences = conferences;

                _ctrl.conference  = _.findWhere(conferences, {active:true});
                if(!_ctrl.conference)
                    _ctrl.conference  = conferences[0];

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
                    console.log(_ctrl.meetings)   
                });
            })
            .then(function(){
                return LoadRequests()    
            }).catch(function(err) {

                _ctrl.error = err.data || err;

            })
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
                var mediaRequestQueries = []
                var queryRequests;
                while(mediaRequests.length) {
                    queryRequests = _.take(mediaRequests, 20);
                    mediaRequests = _.drop(mediaRequests, 20);

                    requestIds = _(queryRequests).map(function(r){ return [r._id, { $oid : r._id}] }).flatten().value();
                    var orgQuery = {
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
                                }
                            })
                        }

                    }) // TODO

            }).catch(function(err) {

                _ctrl.error = err.data || err;

            })
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
        function loadParticipants(request){
            request.showParticipants = !request.showParticipants;
            
            if(!request.participants){
                    
                request.loadingParticipants = true;

                var query = { $or : [ { requestId : request._id }, { requestId : { $oid : request._id } } ] };

                $http.get('/api/v2018/kronos/participation-request/participants', { params: { q: query } }).then(function(result) {

                    request.participants = result.data;
                })
                .finally(function(){
                    request.loadingParticipants = false;
                })
            }
        }

        ///////////////////////////////////////////
        ///////////////KRONOS//////////////////////
        ///////////////////////////////////////////

        //===================================
        //
        //===================================
        function lookUpKronosOrganizations(request, searchText) {

            request = request || _ctrl.selectedRequest;

            if(!request)
                return;

            var query = {};

            if((!searchText && request.organization.kronosIds||[]).length) {
                query.OrganizationUIDs = request.organization.kronosIds;
            }
            else {
                query.FreeText = searchText || request.organization.title;
                query.TypeUIDs = [ KRONOS_MEDIA_TYPE ];
            }

            var _kronos = request.kronos = request.kronos || {};

            _kronos.search  = query.FreeText||'';
            _kronos.loading = true;
            _kronos.error   = null;
            
            return $http.get(kronos.baseUrl+'/api/v2018/organizations', { params: { q: query } }).then(resData).then(function(organizations){

                organizations.forEach(function(o){
                    o.isLinked = _.includes(request.organization.kronosIds||[], o.OrganizationUID);
                });

                _kronos.organizations = organizations;

            }).catch(function(err) {
                _kronos.error = err.data || err;
            }).finally(function(){
                delete _kronos.loading;
            })
        }

        //===================================
        //
        //===================================
        function lookUpKronosContact(participant, request, searchText) {

            var participant = participant || _ctrl.selectedParticipant;

            if(!participant)
                return;

            var query = {};

            if(!searchText && participant.kronosId) {
                query.ContactUID = participant.kronosId;
            }
            else {
                query.FreeText = searchText || ((participant.firstName||'') + ' ' + (participant.lastName||''));
                query.limit    = 25;

                if(request && request.organization && request.organization.kronosIds && request.organization.kronosIds.length)
                    query.OrganizationUIDs = request.organization.kronosIds;
            }

            var _kronos = participant.kronos = participant.kronos || {};

            _kronos.search = query.FreeText||'';
            _kronos.loading = true;
            _kronos.error   = null;

            return $http.get(kronos.baseUrl+'/api/v2018/contacts', { params: { q: query } }).then(resData).then(function(contacts){

                contacts.forEach(function(o){ o.isLinked = participant.kronosId && participant.kronosId == o.ContactUID; });

                participant.kronos.contacts = contacts;

            }).catch(function(err) {
                _kronos.error = err.data || err;
            }).finally(function(){
                delete _kronos.loading;
            })
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

            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/link-kronos/' + korg.OrganizationUID,)
            .then(function(result){               
                if(result.status == 200){                    
                    if(!request.organization.kronosIds)
                        request.organization.kronosIds = [];
                    request.organization.kronosIds.push(korg.OrganizationUID);
                    korg.isLinked=true;
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }

        function removeKronsOrganization(request, korg){
            
            return $http.delete('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/link-kronos/' + korg.OrganizationUID,)
            .then(function(result){               
                if(result.status == 200){
                    var index =  _.indexOf(request.organization.kronosIds, korg.OrganizationUID)
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
            '/participants/' + participant._id+ '/link-kronos/' + kcontact.ContactUID)            
            .then(function(result){               
                if(result.status == 200){
                    _.map(participant.kronos.contacts, function(con){con.isLinked=false;})                    
                    participant.kronosId = kcontact.ContactUID;
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
            '/participants/' + participant._id+ '/link-kronos/' + kcontact.ContactUID)
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
                OrganizationName        : organization.title,
                OrganizationAcronym     : organization.acronym,
                OrganizationTypeUID     : KRONOS_MEDIA_TYPE,
                Address                 : (organization.address.unitNumber||'') + '' + (organization.address.streetNumber||'') + '' +(organization.address.street||''),
                City                    : organization.address.locality,
                State                   : organization.address.administrativeArea,
                Country                 : organization.address.country,
                PostalCode              : organization.address.postalCode,
                Phones                  : _.compact([organization.phone]),
                Emails                  : _.compact([organization.email]),
                EmailCcs                : _.compact([organization.emailCc]),
                Webs                    : _.compact([organization.website])

            }
            request.creatingKronosOrg = true;
            return $http.post(kronos.baseUrl+'/api/v2018/organizations', kronosOrg)
            .then(function(result){               
                if(result.status == 200){                    
                    if(!organization.kronosIds)
                        organization.kronosIds = [];
                    organization.kronosIds.push(result.data.OrganizationUID);

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

            var organizationUID;
            
            if(request.organization.kronosIds.length == 1)
                organizationUID = request.organization.kronosIds[0];
            else{
                //show dialog?
                organizationUID = request.organization.kronosIds[0];
            }
            var kronosContact = {
                OrganizationUID            : organizationUID,
                OrganizationTypeUID        : KRONOS_MEDIA_TYPE,
                Title                      : participant.title,
                FirstName                  : participant.firstName,
                LastName                   : participant.lastName,
                Designation                : participant.designation,
                Department                 : participant.department,
                Affiliation                : participant.affiliation,
                Language                   : participant.language,
                Phones                     : _.compact([participant.phones, participant.phoneDuringMeeting]),
                Mobiles                    : _.compact([participant.mobile]),
                Emails                     : _.compact([participant.email]),
                EmailCcs                   : _.compact([participant.emailCc]),
               DateOfBirth                : participant.dateOfBirth ? moment(participant.dateOfBirth).toDate() : null, // TO FIX DATES IN ASP.NET
                UseOrganizationAddress     : participant.useOrganizationAddress
            };

            if(!participant.useOrganizationAddress){                
                kronosContact.Address    = (participant.address.unitNumber||'') + '' + (participant.address.streetNumber||'') + '' + (participant.address.street||'');
                kronosContact.City       = participant.address.locality;
                kronosContact.State      = participant.address.administrativeArea;
                kronosContact.Country    = participant.address.country;
                kronosContact.PostalCode = participant.address.postalCode;
            }

            participant.creatingKronosContact = true;
            return $http.post(kronos.baseUrl+'/api/v2018/organizations/'+organizationUID+'/contacts', kronosContact)
            .then(function(result){               
                if(result.status == 200){   
                    participant.kronosId = result.data.contactUID;
                    return linkKronosContact(request, participant, result.data).then(function(data){
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
            return lookUpKronosOrganizations(request, search)
        }

        function searchKronosContact(search, participant, request){
            return lookUpKronosContact(participant, request, search)
        }
        
        //===================================
        //
        //===================================
        function resData(res) {  return res.data; }
	}]; 