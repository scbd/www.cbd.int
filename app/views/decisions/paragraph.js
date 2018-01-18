define(['angular', 'lodash', 'app', 'filters/lstring', 'css!./view.css', './view-element', 'filters/moment', 'filters/lodash', './directives/notification', './directives/meeting-document', './directives/meeting', './directives/decision-reference'], function(ng, _) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$compile', '$anchorScroll', function($scope, $http, $route, $location, $compile, $anchorScroll) {

        var treaty    = null ;
        var body      = $route.current.params.body.toUpperCase();
        var session   = parseInt($route.current.params.session);
        var number    = parseInt($route.current.params.decision);
        var parts     = $route.current.params.paragraph.toUpperCase().match(/^([A-Z]*)(\d+)(?:\.(\w+))?(?:\.(\w+))?$/);
        var section   = parts[1]||'';
        var paragraph = parseInt (parts[2]);
        var item      = parsePart(parts[3]);
        var subItem   = parsePart(parts[4]);
        var decision;

             if(body=='COP') treaty = { code : "XXVII8" } ;
    //  else if(body=='CP')  treaty = "XXVII8a";
    //  else if(body=='NP')  treaty = "XXVII8b";

        if(!treaty) {
            alert('ONLY "COP" DECISIONS ARE SUPPORTED');
            throw 'ONLY "COP" DECISIONS ARE SUPPORTED';
        }

        var code = 'CBD/COP/'+pad(session) + '/' + pad(number) + '.' + (section + pad(paragraph)) + ((item && '.'+pad(item))||'') + ((subItem && '.'+pad(subItem))||'');

        $scope.code      = code;
        $scope.romanize      = romanize;
        $scope.pad0          = pad;
        $scope.decision      = undefined;
        $scope.meeting       = undefined;
        $scope.section       = section;
        $scope.paragraph     = paragraph;
        $scope.item          = item ? String.fromCharCode(96+item) : '';
        $scope.$root.page    = { title: 'Decision '+romanize(session)+'/'+number };
        $scope.isPublicMeetingDocument = isPublicMeetingDocument;

        if(section)   $scope.$root.page.title += ' section ' + section;
        if(paragraph) $scope.$root.page.title += ' paragraph ' + paragraph;
        if(item)      $scope.$root.page.title += ' item ('+String.fromCharCode(96+parseInt(item))+')';

        //==============================
        //
        //==============================
        //==============================
        //
        //==============================
        $http.get('/api/v2015/treaties/'+treaty.code, { cache: true } ).then(function(res) {

            treaty = res.data;

            return $http.get('/api/v2016/decision-texts', { params : { q: { treaty:treaty.code, body: body, session: session, decision: number }, fo: 1 }, cache:true });

        }).then(function(res){

            $scope.decision = decision = res.data;

            var link     = $compile(decision.content);
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

        //===========================
        //
        //===========================
        function isPublicMeetingDocument(code) {
            return !/^SCBD\/LOG/.test(code||'');
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

    //========================================
    //
    //
    //========================================
    function solrEscape(value) {

        if(value===undefined) throw "Value is undefined";
        if(value===null)      throw "Value is null";
        if(value==="")        throw "Value is null";

        if(_.isNumber(value)) value = value.toString();
        if(_.isDate  (value)) value = value.toISOString();

        //TODO add more types

        value = value.toString();

        value = value.replace(/\\/g,   '\\\\');
        value = value.replace(/\+/g,   '\\+');
        value = value.replace(/\-/g,   '\\-');
        value = value.replace(/\&\&/g, '\\&&');
        value = value.replace(/\|\|/g, '\\||');
        value = value.replace(/\!/g,   '\\!');
        value = value.replace(/\(/g,   '\\(');
        value = value.replace(/\)/g,   '\\)');
        value = value.replace(/\{/g,   '\\{');
        value = value.replace(/\}/g,   '\\}');
        value = value.replace(/\[/g,   '\\[');
        value = value.replace(/\]/g,   '\\]');
        value = value.replace(/\^/g,   '\\^');
        value = value.replace(/\"/g,   '\\"');
        value = value.replace(/\~/g,   '\\~');
        value = value.replace(/\*/g,   '\\*');
        value = value.replace(/\?/g,   '\\?');
        value = value.replace(/\:/g,   '\\:');

        return value;
    }
});
