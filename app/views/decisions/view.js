define(['app', 'underscore', './view-element'], function(app, _) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', '$compile', '$window', function($scope, $http, $route, $location, $filter, $q, $compile, $window) {

        var elements  = $route.current.params.element.match(/^([0-9]+)(?:\.([A-Z]*)([0-9]+)(?:\.([0-9]+))?)?/);
        var session   = $route.current.params.session;
        var decision  = (elements[1]||'').replace(/^0+/, '');
        var section   = (elements[2]||'').replace(/^0+/, '').toUpperCase();
        var paragraph = (elements[3]||'').replace(/^0+/, '');
        var item      = (elements[4]||'').replace(/^0+/, '');
        var routeCode;

        if(section||paragraph) {

            routeCode  = 'CBD/COP/'+pad($route.current.params.session) +'/';
            routeCode += pad(decision);
            routeCode += '.' + section + pad(paragraph);

            if(item)
                routeCode += '.' + pad(item);
        }

        $scope.romanize      = romanize;
        $scope.pad0          = pad;
        $scope.sumValues     = sumValues;
        $scope.filter        = filter;
        $scope.toggleFilters = toggleFilters
        $scope.list          = !routeCode;
        $scope.session       = session;
        $scope.decision      = parseInt(decision);
        $scope.section       = section;
        $scope.paragraph     = paragraph;
        $scope.item          = item ? String.fromCharCode(96+parseInt(elements[4])) : '';
        $scope.typeCounts    = { informational: 0, operational: 0 };
        $scope.statusCounts  = { implemented: 0, superseded: 0, elapsed: 0, active: 0 };
        $scope.actorCounts   = { };
        $scope.actors        = [];
        $scope.$root.page    = { title: 'Decision '+romanize(session)+'/'+decision };

        if(!$scope.list) {

            $scope.$root.page.title = '';

            if(section)   $scope.$root.page.title += ' section ' + section;
            if(paragraph) $scope.$root.page.title += ' paragraph ' + paragraph;
            if(item)      $scope.$root.page.title += ' item ('+String.fromCharCode(96+parseInt(item))+')';
        }

        var registeredElements = [];


        //==============================
        //
        //==============================
        $http.get('https://api.cbd.int/api/v2015/tests', { params : { q: { decision : romanize($scope.session)+'/'+$scope.decision }, fo: 1 } }).then(function(res) {

            var link    = $compile(res.data.content);
            var content = link($scope);

            $('#content').html(content);

        }).then(function(){

            var filter;

            if(routeCode) {
                filter = { routeCodes : [routeCode] };
            }

            $scope.filter(filter, true);

            if(!$scope.list)
                $window.scrollTo(0,0);
        });



        //==============================
        //
        //==============================
        $scope.$on('registerElement', function (evt, info) {

            evt.stopPropagation();

            if(info.type !='paragraph')
                return;

            $scope.actors = _.union($scope.actors, info.data.actors);

            if(info.data.code == routeCode)
                $scope.current = info;

            registeredElements.push(info);
        });

        //==============================
        //
        //==============================
        function filter(filters) {

            $scope.filters = filters;

            $scope.$broadcast("filterElement", $scope.filters);

            $('#content element.xshow').slideDown({ duration: 250, queue: false });
            $('#content element.xhide').slideUp  ({ duration: 250, queue: false });

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

            $scope.actors.forEach(function(a) {
                $scope.actorCounts[a] = $scope.actorCounts[a] || 0;
            });

            resetSum($scope.typeCounts);
            resetSum($scope.statusCounts);
            resetSum($scope.actorCounts);

            filters = _.omit($scope.filters, 'types');
            entries = _.filter(registeredElements, function(e) { return isMatch(e, filters); });
            entries.forEach(function(e){
                sum($scope.typeCounts, [e.data.type]);
            });

            filters = _.omit($scope.filters, 'statuses');
            entries = _.filter(registeredElements, function(e) { return isMatch(e, filters); });
            entries.forEach(function(e){
                sum($scope.statusCounts, e.data.statuses);
            });

            filters = _.omit($scope.filters, 'actors');
            entries = _.filter(registeredElements, function(e) { return isMatch(e, filters); });
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
            return _(o||{}).values().reduce(function(a,v) { return a+v}, 0);
        }

        //==============================
        //
        //==============================
        function isMatch(entry, filters) {

            if(!filters)
                return true;

            var match = true;

            if(match && filters.actors)   match = _(filters.actors  ).intersection( entry.data.actors  ).some();
            if(match && filters.statuses) match = _(filters.statuses).intersection( entry.data.statuses).some();
            if(match && filters.types)    match = _(filters.types   ).intersection([entry.data.type]   ).some();

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
