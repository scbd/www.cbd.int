import '~/filters/lstring'
import '~/filters/term'
import 'css!./view.css'
import './view-element'
import '~/directives/meetings/documents/document-files'
import './directives/decision-reference'
import './directives/meeting'
import './directives/header-decisions'
import app from '~/app'
import _   from 'lodash'
import ng  from 'angular'
import ViewElement from '~/components/decisions/view-element.vue'
import 'angular-vue'

export { default as template } from './view.html'

export default ['$scope', '$http', '$route', '$location', '$compile', '$anchorScroll', 'user', '$filter', '$q',
    function($scope, $http, $route, $location, $compile, $anchorScroll, user, $filter, $q) {

        $scope.vueOptions = {
            components : {ViewElement}
        };
        var treaty    = null ;
        var body      = $route.current.params.body.toUpperCase();
        var session   = parseInt($route.current.params.session);
        var number    = parseInt($route.current.params.decision);
        var decision;

             if(body=='COP') treaty = { code : "XXVII8" } ;
    //  else if(body=='CP')  treaty = "XXVII8a";
    //  else if(body=='NP')  treaty = "XXVII8b";

        if(!treaty) {
            alert('ONLY "COP" DECISIONS ARE SUPPORTED');
            throw 'ONLY "COP" DECISIONS ARE SUPPORTED';
        }

        $scope.canComment    = canComment();
        $scope.canEdit       = canEdit();
        $scope.edit          = edit;
        $scope.decision      = undefined;
        $scope.documents     = undefined;
        $scope.romanize      = romanize;
        $scope.pad0          = pad;
        $scope.sumValues     = sumValues;
        $scope.filter        = filter;
        $scope.toggleFilters = toggleFilters;
        $scope.typeCounts    = { informational: 0, operational: 0 };
        $scope.statusCounts  = { implemented: 0, superseded: 0, elapsed: 0, active: 0 };
        $scope.actorCounts   = { };
        $scope.actors        = [];
        $scope.newDecision = {};

     //   ng.element("#decision-meta").affix({ offset: { top: 295, bottom:350 } });

        //==============================
        //
        //==============================
        $http.get('/api/v2015/treaties/'+treaty.code, { cache: true } ).then(function(res) {

            treaty = res.data;

            const code = treaty.acronym+'/'+body+'/'+pad(session)+'/'+pad(number);

            return $q.all([
                $http.get('/api/v2016/decision-texts', { params : { q: { treaty:treaty.code, body: body, session: session, decision: number }, fo: 1 }, cache:true }),
                $http.get(`/api/v2021/decisions/${encodeURIComponent(code)}/tree`, { cache:true })
            ]);

        }).then(function(res) {

            $scope.decision = decision = res[0].data;
            $scope.newDecision = res[1].data;

            var link    = $compile(decision.content);
            var content = link($scope);

            ng.element("#content").html(content);

            $scope.subjectsToShow        = getTags($scope.decision, 'subjects');
            $scope.aichiTargetsToShow    = getTags($scope.decision, 'aichiTargets');

        }).then(function(){

            scrollTo($scope.$root.hiddenHash || $location.hash());

            delete $scope.$root.hiddenHash;

            updateSums();

            loadRelatedDecisions($scope.decision.code).then(function(results){
                $scope.decision.decisions = _.union($scope.decision.decisions||[], results);
            });  

            return $http.get('/api/v2013/index', { params: { q : 'schema_s:(decision recommendation) AND treaty_s:'+decision.treaty + ' AND body_s:'+decision.body + ' AND session_i:'+decision.session + ' AND decision_i:'+decision.decision, fl: 'id,symbol_s,schema_s,position_i,meeting_ss,title_*, description_*,file_ss,url_ss', rows:999 } });

        }).then(function(res){

            $scope.documents = _(res.data.response.docs).map(function(n) {
                var doc = _.defaults(n, {
                    _id: n.id,
                    symbol: n.symbol_s,
                    type:   n.schema_s.replace(/^x-/, ''),
                    status : 'public',
                    title : { en : n.title_t },
                    files : _.map(n.file_ss, function(f){ return JSON.parse(f); }),
                    url :  n.url_ss[0]
                });

                if(!doc.files || !doc.files.length)
                    doc.files = [{ language:'en', url:doc.url,  type:'text/html' }];

                return doc;

            }).sortByOrder(['position_i', 'symbol_s'], ['asc', 'asc']).value();

        }).then(function(res){

            if(!canComment())
                return;

            return $http.get('/api/v2017/comments', { params : { q: { type:'decision', resources: decision.code }, c: 1 } }).then(function(res){
                $scope.hasComments = res && res.data && res.data.count;
            });

        }).catch(function(err){
            $scope.error = (err||{}).data || err;
            console.error($scope.error);
        });

        //========================================
        //
        //
        //========================================
        function loadRelatedDecisions(code){

            var WithDot   = code.replace(/(\w+\/\w+\/\w+\/\w+)\/(.+)/, '$1.$2');
            var WithSlash = code.replace(/(\w+\/\w+\/\w+\/\w+)\.(.+)/, '$1/$2');

            var qs = {
                q : { "decisions" : { "$in" : [WithDot, WithSlash]} },
                f : { "code":1 }
            };

            return $http.get('/api/v2016/decision-texts/search',  { params : qs} ).then(function(res){
                return _.map(res.data, 'code');
            });
        }        

        //==============================
        //
        //==============================
        function scrollTo(hash) {
            if(hash) {
                $scope.$applyAsync(function() {
                    $anchorScroll(hash);
                });
            }
        }

        //==============================
        //
        //==============================
        function filter(filters) {

            $scope.filters = filters;

            var content = ng.element("#content");
            var elements = content.find('element');

            if(filters) {

                elements.removeClass('xshow'); // reset
                elements.addClass   ('xhide'); // reset

                content.find('element[data-type~="paragraph"]').each(function(i,e) {
                    e = ng.element(e);

                    if(isMatch(e.data('info'), filters))
                        e.addClass('xshow');
                });

                content.find('element.xshow element').addClass('xshow');
                content.find('element.always'       ).addClass('xshow');
                elements.has("element.xshow"        ).addClass("xshow");
                content.find('element[data-type~="title"]').addClass('xshow');
                content.find('element.xshow element[data-type~="sectionTitle"]').addClass('xshow');
            }
            else {
                elements.addClass('xshow'); // reset
            }

            content.find('element.xshow').removeClass('xhide');

            content.find('.xshow').slideDown({ duration: 250, queue: false });
            content.find('.xhide').slideUp  ({ duration: 250, queue: false });

            updateSums();
        }

        //==============================
        //
        //==============================
        function toggleFilters(newFilters) {

            var filters;
            var oldFilters = $scope.filters || {};

            newFilters = newFilters || {};

            var keys = _.union(_.keys(oldFilters), _.keys(newFilters));

            keys.forEach(function(key) {

                var o = oldFilters[key] || [];
                var n = newFilters[key] || [];
                var r = _(_.difference(o,n)).union(_.difference(n,o)).compact().value();

                if(newFilters[key]===null)
                    r = null;

                if(!_.isEmpty(r)) {
                    filters = filters || {};
                    filters[key] = r;
                }
            });

            filter(filters);
        }

        //==============================
        //
        //==============================
        function updateSums() {

            var filters, entries;
            var paragraphes = ng.element('#content element[data-type~="paragraph"]').map(function(i,e) {
                return ng.element(e).data('info');
            });

            decision.actors.forEach(function(a) {
                $scope.actorCounts[a] = $scope.actorCounts[a] || 0;
            });

            resetSum($scope.typeCounts);
            resetSum($scope.statusCounts);
            resetSum($scope.actorCounts);

            filters = _.omit($scope.filters, 'types');
            entries = _.filter(paragraphes, function(e) { return isMatch(e, filters); });
            entries.forEach(function(e){
                sum($scope.typeCounts, [e.data.type]);
            });

            filters = _.omit($scope.filters, 'statuses');
            entries = _.filter(paragraphes, function(e) { return isMatch(e, filters); });
            entries.forEach(function(e){
                sum($scope.statusCounts, e.data.statuses);
            });

            filters = _.omit($scope.filters, 'actors');
            entries = _.filter(paragraphes, function(e) { return isMatch(e, filters); });
            entries.forEach(function(e){
                sum($scope.actorCounts, e.data.actors);
            });

        }

        //==============================
        //
        //==============================
        function sum(container, entries) {

            _.forEach(entries, function(entry) {
                container[entry] = container[entry] || 0;
                container[entry]++;
            });
        }

        //==============================
        //
        //==============================
        function sumValues(o) {
            return _(o||{}).values().reduce(function(a,v) { return a+v; }, 0);
        }

        //==============================
        //
        //==============================
        function isMatch(entry, filters) {

            if(!filters)
                return true;

            var match = true;

            if(match && filters.actors)         match = _(filters.actors    ).intersection( entry.data.actors  ).some();
            if(match && filters.statuses)       match = _(filters.statuses  ).intersection( entry.data.statuses).some();
            if(match && filters.types)          match = _(filters.types     ).intersection([entry.data.type   ]).some();

            if(match && filters.aichiTargets)   match = _(filters.aichiTargets    ).intersection( entry.data.aichiTargets  ).some();
            if(match && filters.subjects)   match = _(filters.subjects    ).intersection( entry.data.subjects  ).some();

            return match;
        }

        //==============================
        //
        //==============================
        function resetSum(container) {
            for(var k in container)
                container[k] = 0;

            return container;
        }

        //==============================
        //
        //==============================
        function romanize (n) {
            var roman = [ '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX' ];
            return roman[n];
        }

        //==============================
        //
        //==============================
        function pad(input) {

            var output = (input || '').toString();

            while(output.length<2)
                output = '0' + output;

            return output;
        }

        //==============================
        //
        //==============================
        function edit(hash) {

            $location.url(('/'+decision.body+'/'+decision.session+'/'+decision.decision+'/edit').toLowerCase());

            if(hash)
                $location.hash(hash);
        }

        //==============================
        //
        //==============================
        function canEdit() {
            return _.intersection(user.roles, ["Administrator","DecisionTrackingTool"]).length>0
        }

        //==============================
        //
        //==============================
        function canComment() {
            return canEdit() || _.intersection(user.roles, ["ScbdStaff"]).length>0;
        }

        function getTags(collection, field){
            var list  = []
            if(collection[field])
                list = collection[field];

            if(collection.elements){
                var elList = _(collection.elements).map(field).compact().flatten().value();
                list.push(elList);
            }

            _.each(_.flatten(list), function(o){
                if(!$scope[field+'Counts'])
                    $scope[field+'Counts']  = {};
                $scope[field+'Counts'][o] = ($scope[field+'Counts'][o] || 0) + 1; 

            })

            return _(list).flatten().uniq().value();
        }


        $scope.term = function(code){
            var termCode = {identifier:code};
            return $filter("term")(termCode);
        }
    }];