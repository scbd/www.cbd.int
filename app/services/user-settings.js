import app from '~/app';

    app.factory("userSettings", ['$http','$q','authentication','$interval','$timeout', function($http,$q,authentication,$interval,$timeout) {

        var settings;
        var user='';

        if(!user)
          init();
        //============================================================
        //
        //============================================================
        function init() {
            authentication.getUser().then(load);
        }
        //============================================================
        //
        //============================================================
        function set(key,value) {

            var keyArray = key.split(".");

            if(keyArray.length ===1)
              settings[key]=value;
            else{
                if(!settings[keyArray[0]])
                  settings[keyArray[0]]={};
                settings[keyArray[0]][keyArray[1]]=value;
            }
            put(settings);

            return value;
        }
        //============================================================
        //
        //============================================================
        function get(key) {
          var keyArray = key.split(".");

          if(keyArray.length ===1)
            return settings[key];
          else if(settings[keyArray[0]])
            return  settings[keyArray[0]][keyArray[1]];
        }
        //============================================================
        //
        //============================================================
        function setting(key,value) {
            if(typeof value === 'undefined')
              return get(key);
            else
              return set(key,value);
        }
        //============================================================
        //
        //============================================================
        function commit() {
            var url = '/api/v2016/settings/';
            return $http.post(url, {userId:user.userID.toString()}, {}).then(function(){load();}).catch(onError);
        }


        //============================================================
        //
        //============================================================
        function put(key,value) {
            var url = '/api/v2016/settings/'+user.userID;

            if(settings.undb)delete(settings.undb); // hack until schema is fixed
            return $http.put(url, settings, {id:user.userID.toString()}).catch(onError);
        }

        //============================================================
        //
        //============================================================
        function load(userData) {

            if(userData)
              user=userData;
            if(!user.isAuthenticated){user=''; return;}

            var params = {
                f:{history:0}
            };

            return $http.get('/api/v2016/settings/'+user.userID, {'params': params}) //}&f={history:1}'))
                .then(
                    function(response) {

                        if (!(Object.keys(response.data).length === 0 && response.data.constructor === Object)){
                            settings=response.data;
                            return response.data;
                        }
                        else
                            return false;
                }).catch(settingsError);

        }

        //============================================================
        //
        //============================================================
        function settingsError(error) {
          if(error.data.statusCode===404)
            settingsNotFound();
          else
            throw console.log(error.data);
        }
        //============================================================
        //
        //============================================================
        function onError(error) {
            throw console.log(error.data);
        }
        //============================================================
        //
        //============================================================
        function settingsNotFound() {
            commit();
        }
        //============================================================
        //
        //============================================================
        function ready() {
          var deferred = $q.defer();

          var intervallObj = $interval(function() {
            if (settings){
              deferred.resolve(settings);
              $interval.cancel(intervallObj);
            }
          }, 100,30);
          $timeout(function(){if(!settings){deferred.reject('no setting found');throw 'No settings found';}},3300);
          return deferred.promise;
        }

        return {
            set:set,
            get:get,
            setting:setting,
            ready:ready(),
            settings:settings
        }; //return

    }]); //factory
 //require