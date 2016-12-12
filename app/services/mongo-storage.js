define(['app', 'lodash',  'providers/locale'], function(app, _ ){

    app.factory("mongoStorage", ['$http', 'authentication', '$q', 'locale', '$filter', '$timeout', function($http, authentication, $q, locale, $filter, $timeout) {


        var clientOrg = 0; // means cbd


        var conferences = [];
        //============================================================
        //
        //============================================================
        function loadConferences(force) {
            var allPromises = [];
            var numPromises= 1;
            var modified = true;

            allPromises[0] = isModified('conferences').then(
                function(isModified) {
                    modified = (!localStorage.getItem('allConferences') || isModified || force);
                    var params = {};
                    if (modified) {
                        params = {
                            q: {}
                          };
                        numPromises++;
                        allPromises[1]= $http.get('/api/v2016/conferences', {
                            'params': params
                        }).then(function(res) {
                              var oidArray = [];
                              conferences=res.data;
                              numPromises+=conferences.length;
                              _.each(conferences,function(conf){
                                oidArray=[];
                                      _.each(conf.MajorEventIDs, function(id) {
                                          oidArray.push({
                                              '$oid': id
                                          });
                                      });

                                      allPromises.push($http.get("/api/v2016/meetings", {
                                          params: {
                                              q: {
                                                  _id: {
                                                      $in: oidArray
                                                  }
                                              }
                                          }
                                      }).then(function(m) {
                                          conf.meetings = m.data;
                                      }));
                              });

                          });

                    } else{
                            if(_.isEmpty(conferences))
                              conferences=JSON.parse(localStorage.getItem('allConferences'));
                            numPromises++;
                            allPromises.push($q(function(resolve) {resolve(conferences);}));
                    }
                });
                return $q(function(resolve, reject) {
                    var timeOut = setInterval(function() {
                        if ((allPromises.length === 2 && !modified) || (modified && numPromises === allPromises.length && allPromises.length > 2) )
                            $q.all(allPromises).then(function() {
                                clearInterval(timeOut);
                                if(modified)
                                  localStorage.setItem('allConferences', JSON.stringify(conferences));
                                resolve(conferences);
                            });

                    }, 100);
                    $timeout(function(){
                      clearInterval(timeOut);
                      reject('Error: getting conferences timed out 5 seconds');
                    },5000);
                });
        } // loadDocs



        //============================================================
        //
        //============================================================
        function loadDocs(schema,q, pageNumber,pageLength,count,sort,fields,all) {

            var params = {};
            if(!sort)
              sort={'meta.modifiedOn':-1};

            if (!schema) throw "Error: failed to indicate schema loadDocs";
            if(!fields)fields=null;

            params = {
                q: q,
                sk: pageNumber,
                l: pageLength,
                s:sort,//{'meta':{'modifiedOn':1}}//{'meta.modifiedOn':1},
                f:fields
            };


           if(!count)
              return $http.get('/api/v2016/' + schema, {'params': params});
           else
              return injectCount(schema,params,all);
        }

        //============================================================
        //
        //============================================================
        function injectCount(schema,params,all) {

            var promises=[];

            promises[0]=$http.get('/api/v2016/' + schema, {'params':_.clone(params)});
            params.c=1;
            params.f={_id:1};
            promises[1]=$http.get('/api/v2016/' + schema, {'params': params});

           if((!params.q['meta.status'] || _.isObject(params.q['meta.status'])) && all)
              _.each(['draft','request','published','canceled','rejected','archived'], function(status) {
                  var tempP = _.cloneDeep(params);
                  tempP.q['meta.status']=status;
                  promises.push($http.get('/api/v2016/' + schema, {'params': tempP}));
              });

            return $q.all(promises).then(function(res){
                 res[0].count=res[1].data.count;
                 res[0].facits={all:res[1].data.count};
                  var count=2;
                  if((!params.q['meta.status'] || _.isObject(params.q['meta.status'])) && all)
                    _.each(['draft','request','published','canceled','rejected','archived'], function(status) {
                        res[0].facits[status]=res[count].data.count;
                        count++;
                    });
                  else
                    res[0].facits[params.q['meta.status']]=res[1].data.count;

                  return res[0];
            });
        }



        var isModifiedInProgress =null;
        //=======================================================================
        //
        //=======================================================================
        function isModified(schema) {

          if(isModifiedInProgress)
           return isModifiedInProgress;

            var isModified = true;

            var modifiedSchemas = localStorage.getItem('modifiedSchemas');

            if (modifiedSchemas)
                modifiedSchemas = JSON.parse(modifiedSchemas);




            isModifiedInProgress= $q(function(resolve, reject) {

                $http.get('/api/v2016/' + schema + '/last-modified').then(function(lastModified) {

                    if (!lastModified.data) reject('Error: no date returned');

                    if (!modifiedSchemas || lastModified.data !== modifiedSchemas[schema]) {
                        if (!modifiedSchemas) modifiedSchemas = {};

                        modifiedSchemas[schema] = lastModified.data;
                        localStorage.setItem('modifiedSchemas', JSON.stringify(modifiedSchemas));
                        isModifiedInProgress=null;
                        resolve(isModified);
                    } else {

                        isModified = false;
                        isModifiedInProgress=null;
                        resolve(isModified);

                    }
                }).catch(function(err) {
                    isModifiedInProgress=null;
                    reject(err);
                });

            });
            return isModifiedInProgress;
        }

        return {
            loadConferences:loadConferences,
            loadDocs: loadDocs,
        };
    }]);

});