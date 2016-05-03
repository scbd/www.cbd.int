define(['app', 'underscore'], function(app, _) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', function($scope, $http, $route, $location, $filter, $q) {

        $scope.session      = $route.current.params.session;
        $scope.session0     = $scope.session>9 ? '' : '0' + $scope.session;
        $scope.element      = $route.current.params.element;
        $scope.infoCount    = 0;
        $scope.operCount    = 0;
        $scope.statusCounts = { implemented: 0, superseded: 0, elapsed: 0, active: 0 };
        $scope.actors       = [];

        $scope.list = !$route.current.params.element.includes('.');

        var elements  = $route.current.params.element.match(/^([0-9]+)(?:\.([0-9]+)(?:\.([0-9]+))?)?/);
        var routeCode = 'CBD/COP/'+$scope.session0;

        var elementLevel1 = elements[1] ? elements[1] : '0';
        var elementLevel2 = elements[2] ? elements[2] : '0';
        var elementLevel3 = elements[3] ? elements[3] : '0';

        if(elementLevel1.length<2) elementLevel1 = '0' + elementLevel1;
        if(elementLevel2.length<2) elementLevel2 = '0' + elementLevel2;
        if(elementLevel3.length<2) elementLevel3 = '0' + elementLevel3;

        if(elementLevel1!='00') routeCode += '/' + elementLevel1;
        if(elementLevel2!='00') routeCode += '.' + elementLevel2;
        if(elementLevel3!='00') routeCode += '.' + elementLevel3;

        $scope.decision  = parseInt(elementLevel1);
        $scope.decision0 = elementLevel1;

        $http.get('https://api.cbd.int/api/v2015/tests?q={%22decision%22:%22'+romanize($scope.session)+'/'+$scope.decision+'%22}&fo=1'/*, { params : query }*/).then(function(res) {

            $('#content').html(res.data.content);

            $('#content element[data-info]').each(function () {

                var info = JSON.parse($(this).attr('data-info'));

                if(info.type=='title') {
                    $(this).addClass('always');
                }

                if(info.type=='sectionTitle') {
                    $(this).addClass('sectionTitle');
                }

                var name = 'paragraph '+info.paragraph;
                var code = info.paragraph;
                var type = info.data ? info.data.type : '';

                if(type=='information') type = 'informational';


                if(info.data)
                console.log(info.data.code, routeCode)

                if(info.data && info.data.code==routeCode) {
                    $(this).addClass('current');
                    $scope.current = info;
                }

                if(info.data && info.data.actors) {
                    $scope.actors = _.union($scope.actors, info.data.actors);
                }

                if(info.type=='secApara') { code = 'A' + code; name = 'sec. A ' + name; }
                if(info.type=='secBpara') { code = 'B' + code; name = 'sec. B ' + name; }
                if(info.type=='secCpara') { code = 'C' + code; name = 'sec. C ' + name; }
                if(info.type=='secDpara') { code = 'D' + code; name = 'sec. D ' + name; }
                if(info.type=='secEpara') { code = 'E' + code; name = 'sec. E ' + name; }

                if(info.item) {

                    var n = info.item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

                    code += '.' + n;
                    name += ' item ('+info.item+')';
                }


                if(info.paragraph) {


                    $(this).addClass(type);

                    if(info.data && info.data.statuses && info.data.statuses.includes('implemented')) $(this).addClass('implemented');
                    if(info.data && info.data.statuses && info.data.statuses.includes('superseded')) $(this).addClass('superseded');
                    if(info.data && info.data.statuses && info.data.statuses.includes('elapsed')) $(this).addClass('elapsed');
                    if(info.data && info.data.statuses && info.data.statuses.includes('active')) $(this).addClass('active');

                    $(this).addClass('box');

                    if($scope.list) {
                        $(this).prepend('<p><a type="button" class="btn btn-primary btn-xs" href="/decisions/cop/'+$scope.session+'/'+$scope.decision+'.'+code+'"><i class="fa fa-search" aria-hidden="true"></i> '+name+'</a></button></p>');

                        if(info.data && info.data.actors) {
                            var self = this;
                            info.data.actors.forEach(function (actor) {
                                $(self).addClass('actor-'+actor);
                                if(actor=='executive-secretary') actor = 'es';
                                if(actor=='Others') actor = 'others';
                                $(self).prepend('<span class="pull-right label label-default" style="opacity:0.5;margin-right:6px"><i class="fa fa-user" aria-hidden="true"></i> '+actor+'</span> ');
                            });
                        }

                    }
                }



                if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('implemented'))
                    $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> implemented</span> ');
                if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('superseded'))
                    $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> superseded</span> ');
                if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('elapsed'))
                    $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> elapsed</span> ');
                if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('active'))
                    $(this).prepend('<span class="pull-right label label-success" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> active</span> ');

                    if(info.paragraph && $scope.list && type=='operational')
                        $(this).prepend('<span class="pull-right label label-info" style="opacity:0.5;"><i class="fa fa-cog" aria-hidden="true"></i> '+type+'</span>');
                    if(info.paragraph && $scope.list && type=='informational')
                        $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;"><i class="fa fa-info-circle" aria-hidden="true"></i> '+type+'</span>');


                // if(info.data)
                //     $(this).append(JSON.stringify(info.data));

                if(type=='informational') $scope.infoCount++;
                if(type=='operational'  ) $scope.operCount++;

                if(info.data && info.data.statuses && info.data.statuses.includes('implemented')) $scope.statusCounts.implemented++;
                if(info.data && info.data.statuses && info.data.statuses.includes('superseded'))  $scope.statusCounts.superseded++;
                if(info.data && info.data.statuses && info.data.statuses.includes('elapsed'))     $scope.statusCounts.elapsed++;
                if(info.data && info.data.statuses && info.data.statuses.includes('active'))      $scope.statusCounts.active++;


            });

            if(!$scope.list)
                $scope.filter('current', 1);
        });
console.log(elementLevel2)
        if(!$scope.list) {
            window.scrollTo(0, 0);
console.log(elementLevel2)
            $scope.paragraph = parseInt(elementLevel2);

            if(elementLevel3!='00')
                $scope.paragraph += ' item ('+String.fromCharCode(96+parseInt(elementLevel3))+')';
        }

        $scope.filter = function (cls, duration) {

            $scope.filtered = true;

            $('#content element').removeClass('xshow');         // reset
            $('#content element.'+cls).addClass('xshow');
            $('#content element.xshow element').addClass('xshow');
            $('#content element.always').addClass('xshow');
            $("#content element").has("element.xshow").addClass("xshow");
            $('#content element.xshow element.sectionTitle').addClass('xshow');

            $('#content element').addClass('xhide');            // reset
            $('#content element.xshow').removeClass('xhide');

            $("#content element").has("element.xshow").show();
            $('#content element.xshow').slideDown({ duration: duration||250, queue: false });
            $('#content element.xhide').slideUp  ({ duration: duration||250, queue: false });
        }

        $scope.removeFilter = function () {

            $scope.filtered = false;

            $('#content element').removeClass('xhide');         // reset
            $('#content element').addClass('xshow');
            $('#content element.xshow').slideDown(250);
        }

        $scope.romanize = romanize;

        // $scope.decisions = decisions;

        function romanize (n) {
            var roman = [ '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXII', 'XXIV', 'XXV' ];
            return roman[n];
        }
    }];
});
