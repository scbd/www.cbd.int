define(['underscore', 'require', 'ngDialog', 'authentication'], function(_, require) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', 'ngDialog', function($scope, $http, $route, $location, $filter, $q, ngDialog) {

        var data = { title: 'agenda', content: 'loading...' };

        $scope.symbol = $route.current.params.meeting + '/' + $route.current.params.number;
        $scope.save   = save;
        $scope.selectDecision = selectDecision;
        $scope.selectNotification = selectNotification;
        $scope.actionEdit  = edit;
        $scope.actionBox   = function(tag) { surroundSelection(tag); };
        $scope.actionUnbox = function()    { unsurroundSelection(); };
        $scope.element     = {};

        load();

        $scope.$watch('element.type', tag);
        $scope.$watch('element.paragraph', tag);
        $scope.$watch('element.item', tag);
        $scope.$watch('element.subitem', tag);

        return;

        //************************************************************
        //************************************************************
        //************************************************************
        //************************************************************

        function load() {

            //var data = { title: 'agenda', content: $('#content').html() };

            $.ajax({method: 'GET', url: 'https://api.cbd.int/api/v2015/tests?q={"decision":"'+$scope.symbol+'"}&fo=1', contentType: 'application/json' }).done(function( msg ) {

                msg = msg || { decision: $scope.symbol, content: 'paste here' };

                data = msg;

                $('#content').html(msg.content);
                $('#content').mousedown(function () { selectNode(this); });

                clean($('#content')[0]);

                $('element').mousedown(function () { selectNode(this); });
            });
        }

        function save() {

            selectNode(null);

            data.title = "agenda";
            data.content = $('#content').html();

            if(!data._id) {
                $.ajax({method: "POST", url: "https://api.cbd.int/api/v2015/tests", data: JSON.stringify(data), contentType: "application/json" }).done(function( msg ) {
                    data._id = msg.id;
                    alert( "Your document has been successfully created." );
                });
            } else {
                $.ajax({method: "PUT", url: "https://api.cbd.int/api/v2015/tests/"+data._id, data: JSON.stringify(data), contentType: "application/json" }).done(function( msg ) {
                    alert( "Your document has been successfully updated." );
                });
            }
        }

        function surroundSelection(tag) {

            var range = window.getSelection().getRangeAt(0);
            var range2 = range.cloneRange();

            var span = document.createElement(tag);
            var content = range.extractContents();

            span.appendChild(content);
            range.insertNode(span);

            clean($('#content')[0]);
            clean($('#content')[0]);

            $('element').mousedown(function () { selectNode(this); });

            selectNode(span);
        }

        var selectedElement = null;

        function unsurroundSelection() {

            if(!selectedElement) return alert('no selectedElement');

            $(selectedElement).contents().unwrap();

            selectedElement = null;
        }

        function edit() {

            var $div = $('#content'), isEditable = $div.is('.editable');
            $div.prop('contenteditable', !isEditable).toggleClass('editable');
            $div.focus();
        }

        function selectNode(node) {

            $(selectedElement).attr('data-info', JSON.stringify($scope.element));

            $(selectedElement).removeClass('selected');

            selectedElement = node;

            $(selectedElement).addClass('selected');

            $scope.element = $(selectedElement).data('info');
            $scope.$applyAsync();

            event.stopPropagation();
        }

        function tag() {

            if(selectedElement && $scope.element) {

                var tag = $scope.element.type || '';

                if($scope.element.paragraph) tag += ' ' + $scope.element.paragraph;
                if($scope.element.item)      tag += '' + $scope.element.item;
                if($scope.element.subitem)   tag += ' (' + $scope.element.subitem + ')';

                $(selectedElement).attr('data-type', tag);
            }
        }

        function clean(node) {

            for(var n = 0; n < node.childNodes.length; n ++) {

                var child = node.childNodes[n];

                if(child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {

                    node.removeChild(child);
                    n --;

                } else if(child.nodeType === 1) {

                    clean(child);

                    if(child.innerHTML=='')
                        node.removeChild(child);
                }
            }
        }

        //************************************************************

        //===========================
        //
        //===========================
        function selectDecision() {

            openDialog('./select-decision-dialog', { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){
                    if(res.value)
                       console.log(res.value);
                });
            });
        }

        //===========================
        //
        //===========================
        function selectNotification() {

            openDialog('./select-notification-dialog', { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){
                    if(res.value)
                       console.log(res.value);
                });
            });
        }

        //===========================
        //
        //===========================
        function openDialog(dialog, options) {

            options = options || {};

            return $q(function(resolve, reject) {

                require(['text!'+dialog+'.html', dialog], function(template, controller) {

                    options.plain = true;
                    options.template = template;
                    options.controller = controller;

                    var dialog = ngDialog.open(options);

                    dialog.closePromise.then(function(res){

                        if(res.value=="$escape")      delete res.value;
                        if(res.value=="$closeButton") delete res.value;

                        return res;
                    });

                    resolve(dialog);

                }, reject);
            });
        }
    }];
});

(function(){

    var cache = [0],
        expando = 'data' + +new Date();

    function data(elem) {

        var cacheIndex = elem[expando],
            nextCacheIndex = cache.length;

        if(!cacheIndex) {
            cacheIndex = elem[expando] = nextCacheIndex;
            cache[cacheIndex] = {};
        }

        return {
            get : function(key) {
                return cache[cacheIndex][key];
            },
            set : function(key, val) {
                cache[cacheIndex][key] = val;
                return val;
            }
        }

    }

    window.data = data;

})();
