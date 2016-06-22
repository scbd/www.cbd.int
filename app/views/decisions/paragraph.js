define(['angular', 'app', 'css!./view.css', './view-element'], function(ng) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$compile', '$anchorScroll', function($scope, $http, $route, $location, $compile, $anchorScroll) {

        var parts     = $route.current.params.paragraph.toUpperCase().match(/^([A-Z]*)(\d+)(?:\.(\w+))?(?:\.(\w+))?$/);
        var session   = parseInt($route.current.params.session .replace(/^0+/, ''));
        var decision  = parseInt($route.current.params.decision.replace(/^0+/, ''));
        var section   = parts[1]||'';
        var paragraph = parseInt (parts[2]);
        var item      = parsePart(parts[3]);
        var subItem   = parsePart(parts[4]);

        var code = 'CBD/COP/'+pad(session) + '/' + pad(decision) + '.' + (section + pad(paragraph)) + ((item && '.'+pad(item))||'') + ((subItem && '.'+pad(subItem))||'');

        $scope.romanize      = romanize;
        $scope.pad0          = pad;
        $scope.session       = session;
        $scope.decision      = parseInt(decision);
        $scope.section       = section;
        $scope.paragraph     = paragraph;
        $scope.item          = item ? String.fromCharCode(96+item) : '';
        $scope.$root.page    = { title: 'Decision '+romanize(session)+'/'+decision };

        if(section)   $scope.$root.page.title += ' section ' + section;
        if(paragraph) $scope.$root.page.title += ' paragraph ' + paragraph;
        if(item)      $scope.$root.page.title += ' item ('+String.fromCharCode(96+parseInt(item))+')';

        //==============================
        //
        //==============================
        $http.get('/api/v2015/tests', { params : { q: { decision : romanize(session)+'/'+decision }, fo: 1 }, cache:true }).then(function(res) {

            var link     = $compile(res.data.content);
            var content  = link($scope);
            var elements = content.find('element');

            content.find('element[data-type~="paragraph"]').each(function(i,e) {
                e = ng.element(e);

                var info = e.data('info');

                if(info && info.data && info.data.code == code) {

                    e.addClass('xshow');
                    e.addClass('current');

                    $scope.current = $scope.current || info;

                    return false;
                }
            });

            elements.addClass('xhide'); // reset
            content.find('element.xshow element').addClass('xshow');
            content.find('element.always'       ).addClass('xshow');
            elements.has("element.xshow"        ).addClass("xshow");
            content.find('element[data-type~="title"]').addClass('xshow');
            content.find('element.xshow element[data-type~="sectionTitle"]').addClass('xshow');
            content.find('element.xshow').removeClass('xhide');

            content.find('.xshow').show();
            content.find('.xhide').hide();

            ng.element("#content").html(content);

        }).then(function(){

            if(!$scope.current)
                throw { code : 'notFoud', message : "Paragraph not found" };

            scrollTo($scope.$root.hiddenHash || $location.hash());

            delete $scope.$root.hiddenHash;

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
        function parsePart(val) {

            if(!val)
                return;

            if(/^[A-Z]/.test(val))
                val = val.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

            return parseInt(val);
        }

    }];
});
