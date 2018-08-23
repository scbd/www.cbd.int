define(['app'], function(app) {

	return ['$http', 'user', function($http, user) {
        var _ctrl = this;

        load();
        
        //===================================
        //
        //===================================
        function load() {

            delete _ctrl.error;
            
            return $http.get('/api/v2016/conferences', { 
                params: {
                    f: { code:1, Title:1, MajorEventIDs:1 }, 
                    q: { timezone: { $exists:true }, venueId: { $exists:true } },
                    s: { StartDate:-1 } 
                }
            }).then(resData).then(function(conferences) {

                _ctrl.conferences = conferences;
                _ctrl.conference  = conferences[0];

                return _ctrl.conference

            }).then(function(){
                
                return $http.get('/api/v2018/xxx', { params: { q: { xyz : _ctrl.conference._id } } }).then(resData) // TODO

            }).then(function(mediaRequests) { 

                _ctrl.requests = mediaRequests;

            }).catch(function(err) {

                _ctrl.error = err.data || err;

            })
        }

        //===================================
        //
        //===================================
        function resData(res) {  return res.data; }
	}]; 
});
