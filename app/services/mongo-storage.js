define(['app', 'lodash'], function(app, _) {

    app.factory("mongoStorage", ['$http','$rootScope','$q','$timeout','$filter', function($http,$rootScope,$q,$timeout,$filter) {

       var clientOrg = 0; // means cbd


        //============================================================
        //
        //============================================================
        function save(schema, doc) {
            var url = '/api/v2016/' + schema;

            var params = {};
            if (!doc.meta) doc.meta ={};
            if (!doc.meta.clientOrg) doc.meta.clientOrg = clientOrg;

            if (doc._id) {
                params.id = doc._id;
                url = url + '/' + doc._id;

                return $http.patch(url, doc, params);
            } else {
                return $http.post(url, doc, params);
            } //create
        }



        //============================================================
        //
        //============================================================
        function loadDocs(schema,q, pageNumber,pageLength,sort,fields) {

            var params = {};
            if(!sort)
              sort={'meta.modifiedOn':-1};

            if (!schema) throw "Error: failed to indicate schema loadDocs";

            params = {
                q: q,
                sk: pageNumber,
                l: pageLength,
                s:sort,//{'meta':{'modifiedOn':1}}//{'meta.modifiedOn':1},
                f:fields
            };

            return $http.get('/api/v2016/' + schema, {'params': params});

        }


        //============================================================
        //
        //============================================================
        function loadDoc(schema, _id) {
          var params = {

              f:{history:0}
          };
            return $q.when($http.get('/api/v2016/' + schema + '/' + _id, {'params': params})) //}&f={history:1}'))
                .then(

                    function(response) {
                        if (!_.isEmpty(response.data))
                            return response.data;
                        else
                            return false;

                    });
        }


        return {
            loadDoc:loadDoc,
            save: save,
            loadDocs:loadDocs
        }; //return
    }]); //factory
}); //require