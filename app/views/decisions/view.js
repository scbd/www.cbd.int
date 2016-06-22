define(['app', 'underscore', 'angular', 'css!./view.css', './view-element'], function(app, _, ng) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$compile', '$anchorScroll', function($scope, $http, $route, $location, $compile, $anchorScroll) {

        var session   = parseInt($route.current.params.session .replace(/^0+/, ''));
        var decision  = parseInt($route.current.params.decision.replace(/^0+/, ''));

        $scope.session       = session;
        $scope.decision      = decision;
        $scope.romanize      = romanize;
        $scope.pad0          = pad;
        $scope.sumValues     = sumValues;
        $scope.filter        = filter;
        $scope.toggleFilters = toggleFilters;
        $scope.typeCounts    = { informational: 0, operational: 0 };
        $scope.statusCounts  = { implemented: 0, superseded: 0, elapsed: 0, active: 0 };
        $scope.actorCounts   = { };
        $scope.actors        = [];
        $scope.$root.page    = { title: 'Decision '+romanize(session)+'/'+decision };

        ng.element("#decision-meta").affix({ offset: { top: 295, bottom:350 } });

        //==============================
        //
        //==============================
        $http.get('/api/v2015/tests', { params : { q: { decision : romanize(session)+'/'+decision }, fo: 1 }, cache:true }).then(function(res) {

            var link    = $compile(res.data.content);
            var content = link($scope);

            ng.element("#content").html(content);

            content.find('element[data-type~="paragraph"]').each(function(i,e) {
                $scope.actors = _.union($scope.actors, ng.element(e).data('info').data.actors);
            });

        }).then(function(){

            scrollTo($scope.$root.hiddenHash || $location.hash());

            delete $scope.$root.hiddenHash;

            updateSums();

        }).catch(function(err){
            $scope.error = (err||{}).data || err;
            console.error($scope.error);
        });

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

            $scope.actors.forEach(function(a) {
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

            if(match && filters.actors)     match = _(filters.actors    ).intersection( entry.data.actors  ).some();
            if(match && filters.statuses)   match = _(filters.statuses  ).intersection( entry.data.statuses).some();
            if(match && filters.types)      match = _(filters.types     ).intersection([entry.data.type   ]).some();

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
    }];
});
