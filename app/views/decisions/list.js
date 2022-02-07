import '~/app';
import './directives/meeting';
import './directives/header-decisions'; 

    export { default as template } from './list.html'
    export default ['$scope', '$http', '$route', '$location', 'user', function($scope, $http, $route, $location, user) {

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

        $scope.edit = edit;
        $scope.body = body;
        $scope.session = session;
        $scope.canComment = canComment();
        $scope.$root.page = { title: body+'-'+session+' Decisions' };

        //=================================
        //
        //=================================
        function load() {

            return $http.get('/api/v2016/decision-texts', { params : { q : { treaty:treaty.code,  body: body, session: session }, s: { decision:1 }, f: { session: 1, decision: 1 , symbol: 1, title: 1, meeting: 1, body: 1, code: 1 } } }).then(function(res){

                $scope.decisions = res.data;

                return $http.get('/api/v2015/treaties/'+treaty.code, { cache: true } );

            }).then(function(res){

                $scope.treaty = treaty = res.data;

            }).then(function(){

                if(!canComment())
                    return;

                $scope.decisions.forEach(function(d){
                    $http.get('/api/v2017/comments', { params : { q: { type:'decision', resources: d.code }, c:1 } }).then(function(res){
                        d.hasComments = res && res.data && res.data.count;
                    });
                });

            }).catch(function(err){

                err = (err||{}).data || err;

                console.error(err);
            });
        }

        //==============================
        //
        //==============================
        function canComment() {
            return _.intersection(user.roles, ["Administrator","DecisionTrackingTool", "ScbdStaff"]).length>0
        }

        //==============================
        //
        //==============================
        function edit(decision, hash) {

            $location.url(('/'+decision.body+'/'+decision.session+'/'+decision.decision+'/edit').toLowerCase());

            if(hash)
                $location.hash(hash);

        }
    }];

