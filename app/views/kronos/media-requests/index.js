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

            if(request.organization.kronosIds) {
                query.OrganizationUIDs = request.organization.kronosIds;
            }
            else {
                query.FreeText = request.organization.title;
                query.TypeUIDs = [ KRONOS_MEDIA_TYPE ];
            }

            var _kronos = request.kronos = request.kronos || {};

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

        //===================================
        //
        //===================================
        function resData(res) {  return res.data; }
	}]; 
});
