define(['app', 'lodash', './media-organization-partial'], function(app, _) {

	return ['$http', 'user', function($http, user) {
        var _ctrl = this;

        _ctrl.selectOrganization    = selectOrganization;
        _ctrl.selectParticipant     = selectParticipant;
        _ctrl.searchKronos          = searchKronos;
        _ctrl.loadParticipants      = loadParticipants;
        _ctrl.attachmentUrl         = attachmentUrl
        _ctrl.kronos = {};

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
        function selectOrganization(request) {
            _ctrl.selectedRequest = request;
            if(request.organization.kronosId) {

            } else {
                _ctrl.kronos.search = request.organization.title;    
                searchKronos();
            }
        }


        //===================================
        //
        //===================================
        function selectParticipant(request, participant) {
            _ctrl.selectedRequest       = request;
            _ctrl.selectedParticipant   = participant;
            if(request.organization.kronosId) {

            } else {
                _ctrl.kronos.search = request.organization.title;    
                searchKronos();
            }
        }

        function attachmentUrl(url){
            if(!url)return''
            if(~url.indexOf('cbd.documents.temporary'))
                return url
            return '/participation/download/'+encodeURIComponent(url).replace(/%2f/gi, '/');

        }
        
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
        function searchKronos() {

            var query = {};

            if(_ctrl.kronos.search) query.FreeText = _ctrl.kronos.search;
            
            loadKronosOrganization({ FreeText : _ctrl.kronos.search });
        }


        //===================================
        //
        //===================================
        function loadKronosOrganization(query) {

            _ctrl.kronos.loading=true;

            return $http.get('/api/v2018/organizations', { params: { q: query } }).then(resData).then(function(organizations){

                _ctrl.kronos.organizations = organizations;

            }).catch(function(err) {

                _ctrl.error = err.data || err;

            }).finally(function(){
                delete _ctrl.kronos.loading;
            })

        }

        //===================================
        //
        //===================================
        function resData(res) {  return res.data; }
	}]; 
});
