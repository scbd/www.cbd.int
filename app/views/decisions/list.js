define(['app','./directives/meeting'], function() { 'use strict';

    return ['$scope', '$http', '$route', function($scope, $http, $route) {

        var treaty        = null;
        var body          = $route.current.params.body.toUpperCase();
        var session       = parseInt($route.current.params.session);

             if(body=='COP') treaty = { code : "XXVII8" } ;
    //  else if(body=='CP')  treaty = "XXVII8a";
    //  else if(body=='NP')  treaty = "XXVII8b";

        if(!treaty) {
            alert('ONLY "COP" DECISIONS ARE SUPPORTED');
            throw 'ONLY "COP" DECISIONS ARE SUPPORTED';
        }

        load();

        $scope.body = body;
        $scope.session = session;
        $scope.$root.page = { title: body+'-'+session+' Decisions' };

        //=================================
        //
        //=================================
        function load() {

            return $http.get('/api/v2016/decision-texts', { params : { q : { treaty:treaty.code,  body: body, session: session }, s: { decision:1 }, f: { session: 1, decision: 1 , symbol: 1, title: 1, meeting: 1 } } }).then(function(res){

                $scope.decisions = res.data;

                return $http.get('/api/v2015/treaties/'+treaty.code, { cache: true } );

            }).then(function(res){

                $scope.treaty = treaty = res.data;

            }).catch(function(err){

                err = (err||{}).data || err;

                console.error(err);
            });
        }
    }];
});
