define(['app', 'lodash', 'services/kronos', './media-organization-partial'], function(app, _) {

    var KRONOS_MEDIA_TYPE = '0000000052000000cbd05ebe0000000b';

	return ['$http', 'user', 'kronos', '$q', function($http, user, kronos, $q) {
        var _ctrl = this;

        _ctrl.selectRequest         = selectRequest;
        _ctrl.selectParticipant     = selectRequest;
        _ctrl.loadParticipants      = loadParticipants;
        _ctrl.attachmentUrl         = attachmentUrl
        _ctrl.selectedRequest       = null;
        _ctrl.selectedParticipant   = null;



        _ctrl.linkKronsOrganization             = linkKronsOrganization;
        _ctrl.removeKronsOrganization           = removeKronsOrganization;
        _ctrl.linkKronosContact                 = linkKronosContact;
        _ctrl.removeKronosContact               = removeKronosContact;        
        _ctrl.removeOrganizationAccreditation   = removeOrganizationAccreditation;
        _ctrl.accrediateOrganization            = accrediateOrganization
        _ctrl.isLinked                          = isLinked
        

        load();
        
        //===================================
        //
        //===================================
        function load() {

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

            }).then(function(){
                
                return $http.get('/api/v2018/kronos/participation-requests', { params: { q : { $or : [{conference : { $oid:_ctrl.conference._id }}, { conference : _ctrl.conference._id }]}}}).then(resData) // TODO

            }).then(function(mediaRequests) { 

                _ctrl.requests = mediaRequests;

                var requestIds = _.map(mediaRequests,function(r){ return { $oid : r._id}});

                var orgQuery = {
                    q : { requestId : {$in : requestIds} }
                }
                
                return $http.get('/api/v2018/kronos/participation-request/organizations', { params: orgQuery})
                    .then(function(result) { 
                        var organizations = result.data;
                        if(organizations && organizations.length >0){

                            _.map(organizations, function(organization){
                                var request = _.findWhere(_ctrl.requests, {_id : organization.requestId});
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
                $http.get('/api/v2018/kronos/participation-request/participants', { 
                    params: {
                        q: { requestId: { $oid : request._id }}
                    }
                }).then(function(result) {
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
        function lookUpKronosOrganizations(request) {

            request = request || _ctrl.selectedRequest;

            if(!request)
                return;

            var query = {};

            if((request.organization.kronosIds||[]).length) {
                query.OrganizationUIDs = request.organization.kronosIds;
            }
            else {
                query.FreeText = request.organization.title;
                query.TypeUIDs = [ KRONOS_MEDIA_TYPE ];
            }

            var _kronos = request.kronos = request.kronos || {};

            _kronos.loading = true;
            _kronos.error   = null;
// kronos.baseUrl+
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
        function lookUpKronosContact(participant, request) {

            var participant = participant || _ctrl.selectedParticipant;

            if(!participant)
                return;

            var query = {};

            if(participant.kronosId) {
                query.ContactUID = participant.kronosId;
            }
            else {
                query.FreeText = participant.firstName||'' + ' ' + participant.lastName||'';
                query.limit    = 25;

                if(request && request.kronos && request.kronos.organizations && request.kronos.organizations.length)
                    query.OrganizationUIDs = _.map(request.kronos.organizations, 'OrganizationUID');
            }

            var _kronos = participant.kronos = participant.kronos || {};

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

        function accrediateOrganization(request){
            
            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/accrediate')
            .then(function(result){               
                request.organization.accredited = result.data.accredited;
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }

        function removeOrganizationAccreditation(request){
            
            return $http.delete('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/accrediate')
            .then(function(result){               
                request.organization.accredited = result.data.accredited;
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            });
        }

        function linkKronsOrganization(request, korg){

            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + '/link-kronos/' + korg.OrganizationUID,)
            .then(function(result){               
                if(result.status == 200){                    
                    if(!request.organization.kronosIds)
                        request.organization.kronosIds = [];
                    request.organization.kronosIds.push(korg.OrganizationUID);
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
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })    
        }

        function linkKronosContact(request, participant, korg){

            return $http.put('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + 
            '/participants/' + participant._id+ '/link-kronos/' + korg.ContactUID)
            .then(function(result){               
                if(result.status == 200){                    
                    participant.kronosId = korg.ContactUID;
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })
        }

        function removeKronosContact(request, participant, korg){
            
            return $http.delete('/api/v2018/kronos/participation-request/' + request._id + '/organizations/' + request.organization._id + 
            '/participants/' + participant._id+ '/link-kronos/' + korg.ContactUID)
            .then(function(result){               
                if(result.status == 200){             
                    participant.kronosId = undefined;
                }
            }).catch(function(err) {
               console.log(err)
            }).finally(function(){
                // delete _kronos.loading;
            })    
        }
        
        
        function isLinked(LinkedIds, kronosId){
            return _.contains(LinkedIds, kronosId)
        }
        //===================================
        //
        //===================================
        function resData(res) {  return res.data; }
	}]; 
});
