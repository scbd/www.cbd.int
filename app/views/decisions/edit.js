define(['underscore', 'require', 'rangy', 'jquery', './select-actors-list', './select-statuses-list', 'ngDialog', 'authentication', 'filters/moment'], function(_, require, rangy, $, actorList, statusesList) { 'use strict';

    var roman = [ undefined, 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX' ];

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', 'ngDialog', function($scope, $http, $route, $location, $filter, $q, ngDialog) {

        var treaty = "CBD";
        var body   = "COP";
        var session = roman.indexOf($route.current.params.meeting.toUpperCase());
        var decision = parseInt($route.current.params.number);
        var selectedElement = null;

        var data = { title: 'agenda', content: 'loading...' };

        $scope.symbol = roman[session] + '/' + decision;
        $scope.save   = save;
        $scope.upload = upload;
        $scope.selectActors = selectActors;
        $scope.deleteActor  = deleteActor;
        $scope.selectStatuses = selectStatuses;
        $scope.deleteStatus   = deleteStatus;
        $scope.selectDecision = selectDecision;
        $scope.deleteDecision = deleteDecision;
        $scope.selectNotification = selectNotification;
        $scope.deleteNotification = deleteNotification;
        $scope.lookupNotification = lookupNotification;
        $scope.actionEdit  = edit;
        $scope.isEditable  = isEditable;
        $scope.tag         = tag;
        $scope.toggle      = toggle;
        $scope.actionBox   = function(tag) { surroundSelection(tag); };
        $scope.actionUnbox = function()    { unsurroundSelection(); };
        $scope.actionClean = function()    { removeSelectionFormatting(); };
        $scope.element     = {};
        $scope.actorsMap   = _(actorList   ).reduce(function(r,v){ r[v.code] = v; return r; }, {});
        $scope.statusesMap = _(statusesList).reduce(function(r,v){ r[v.code] = v; return r; }, {});

        load();

        return this;

        //************************************************************
        //************************************************************
        //************************************************************
        //************************************************************

        //===========================
        //
        //===========================
        function load() {

            //var data = { title: 'agenda', content: $('#content').html() };

            $.ajax({method: 'GET', url: 'https://api.cbd.int/api/v2015/tests?q={"decision":"'+$scope.symbol+'"}&fo=1', contentType: 'application/json' }).done(function( msg ) {

                msg = msg || { decision: $scope.symbol, content: 'paste here' };

                data = msg;

                $('#content').html(msg.content);

                clean($('#content')[0]);
                clean($('#content')[0]);
                clean($('#content')[0]);

                $('#content,element').mousedown(function (event) {

                    event.stopPropagation();

                    var node = this;

                    $scope.$applyAsync(function(){
                        selectNode(node);
                    });
                });
            });
        }

        //===========================
        //
        //===========================
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
                $.ajax({method: "PUT", url: "https://api.cbd.int/api/v2015/tests/"+data._id, data: JSON.stringify(data), contentType: "application/json" }).done(function() {
                    alert( "Your document has been successfully updated." );
                });
            }
        }

        //===========================
        //
        //===========================
        function surroundSelection(tag) {

            var range = window.getSelection().getRangeAt(0);

            var commonAncestor = $(range.commonAncestorContainer);

            if(!commonAncestor.is("#content") && !commonAncestor.parents('#content').size()) {
                alert('Please select text from the decision');
                return;
            }

            var span = document.createElement(tag);
            var content = range.extractContents();

            span.appendChild(content);
            range.insertNode(span);

            clean($('#content')[0]);
            clean($('#content')[0]);
            clean($('#content')[0]);

            $('element').mousedown(function () { selectNode(this); });

            selectNode(span);
        }

        //===========================
        //
        //===========================
        function unsurroundSelection() {

            if(!selectedElement) return alert('no selectedElement');

            $(selectedElement).contents().unwrap();

            selectedElement = null;
        }

        //===========================
        //
        //===========================
        function edit(editable) {

            var $div = $('#content');

            editable = editable===undefined ? !isEditable() : !!editable;

            $div.prop('contenteditable', editable);

            if(editable)
                $div.focus();
        }

        //===========================
        //
        //===========================
        function isEditable() {
            return $('#content').prop('contenteditable') == 'true';
        }

        //===========================
        //
        //===========================
        function selectNode(node) {

            delete $scope.formattingLocked;

            $(selectedElement).attr('data-info', JSON.stringify($scope.element));

            $(selectedElement).removeClass('selected');

            selectedElement = node;

            $(selectedElement).addClass('selected');

            $scope.element = $(selectedElement).data('info');

            if($scope.element && $scope.element.data && $scope.element.data.type == 'information')
                $scope.element.data.type = 'informational';

            $scope.formattingLocked = !!($scope.element && $scope.element.data);
        }

        //===========================
        //
        //===========================
        function tag() {

            if(!selectedElement) return;
            if(!$scope.element)  return;

            var element = $scope.element;

            element.section   = element.section  ||undefined;
            element.paragraph = element.paragraph||undefined;
            element.item      = element.item     ||undefined;
            element.subitem   = element.subitem  ||undefined;

            element.data = element.data || {
                treaty: treaty,
                body: body,
                session : session,
                decision : decision
            };

            var data = element.data;

            data.section   = element.section   && element.section.toUpperCase();
            data.paragraph = element.paragraph && parseInt(element.paragraph);
            data.item      = element.item      && element.item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
            data.subitem   = element.subitem   && roman.indexOf(element.subitem.toUpperCase());

            data.code  = data.treaty + '/' + data.body + '/' + pad(data.session) + '/' + pad(data.decision);
            data.code += '.'+(data.section||'') + pad(element.paragraph);

            if(data.item)                 data.code += '.'+pad(data.item);
            if(data.item && data.subitem) data.code += '.'+pad(data.subitem);

            // tag

            var tag = element.type || '';

            if(element.section)   tag += ' ' + element.section;
            if(element.paragraph) tag += ' ' + element.paragraph;
            if(element.item)      tag += ''  + element.item;
            if(element.subitem)   tag += ' (' + element.subitem + ')';

            $(selectedElement).attr('data-type', tag);

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
        function toggle(array, value) {

            array = array || [];

            if(~array.indexOf(value)) {
                while(~array.indexOf(value))
                    array.splice(array.indexOf(value), 1);
            }
            else {
                array.push(value);
            }

            if(!array.length)
                array = undefined;

            return array;
        }

        //===========================
        //
        //===========================
        function clean(node) {

            for(var n = 0; n < node.childNodes.length; n ++) {

                var child = node.childNodes[n];

                if(child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {

                    node.removeChild(child);
                    n --;

                } else if(child.nodeType === 1) {

                    clean(child);

                    if(!child.innerHTML)
                        node.removeChild(child);
                }
            }
        }

        //===========================
        //
        //===========================
        function upload() {

            var fileUpload = $("#fileUpload");

            fileUpload.bind("change", upload_fileSelected);
            fileUpload.click();
        }

        //===========================
        //
        //===========================
        function upload_fileSelected() {

            var fileUpload = $("#fileUpload");

            fileUpload.unbind("change", upload_fileSelected);

            var file = fileUpload[0].files[0];

            if(!file)
                return;

            $scope.element.files = $scope.element.files || [];
            $scope.element.files.push({ filename : file.name.toLowerCase(), size : file.size });
            $scope.$digest();
        }



        //************************************************************

        //===========================
        //
        //===========================
        function selectActors() {

            openDialog('./select-actors-dialog', { showClose: false, resolve : { actors: function() { return $scope.element.data.actors; } } }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    var actors = res.value.actors;

                    if(actors && !actors.length)
                        actors = undefined;

                    $scope.element.data.actors = actors;
                });
            });
        }

        //===========================
        //
        //===========================
        function deleteActor(item) {

            if(!$scope.data && !$scope.element.data)
                return;

            var items = $scope.element.data.actors || [];
            var index = items.indexOf(item);

            if(index>=0) {
                items.splice(index, 1);
            }

            $scope.element.data.actors = items.length ? items : undefined;
        }


            //===========================
            //
            //===========================
            function selectStatuses() {

                openDialog('./select-statuses-dialog', { showClose: false, resolve : { statuses: function() { return $scope.element.data.statuses; } } }).then(function(dialog){

                    dialog.closePromise.then(function(res){

                        if(!res.value)
                            return;

                        var statuses = res.value.statuses;

                        if(statuses && !statuses.length)
                            statuses = undefined;

                        $scope.element.data.statuses = statuses;
                    });
                });
            }

            //===========================
            //
            //===========================
            function deleteStatus(item) {

                if(!$scope.data && !$scope.element.data)
                    return;

                var items = $scope.element.data.statuses || [];
                var index = items.indexOf(item);

                if(index>=0) {
                    items.splice(index, 1);
                }

                $scope.element.data.statuses = items.length ? items : undefined;
            }

        //===========================
        //
        //===========================
        function selectDecision() {

            openDialog('./select-decision-dialog', { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    $scope.element.decisions = $scope.element.decisions || [];
                    $scope.element.decisions.push(res.value);
                });
            });
        }

        //===========================
        //
        //===========================
        function deleteDecision(item) {

            var items = $scope.element.decisions || [];
            var index = items.indexOf(item);

            if(index>=0) {
                items.splice(index, 1);
            }
        }

        //===========================
        //
        //===========================
        function selectNotification() {

            openDialog('./select-notification-dialog', { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    $scope.element.data.notifications = $scope.element.data.notifications || [];
                    $scope.element.data.notifications.push(res.value.symbol);
                });
            });
        }

        //===========================
        //
        //===========================
        function deleteNotification(item) {

            var items = $scope.element.notifications || [];
            var index = items.indexOf(item);

            if(index>=0)
                items.splice(index, 1);
        }

        //===========================
        //
        //===========================
        var __notifications;
        function lookupNotification(code) {

            __notifications = __notifications||{};

            if(__notifications[code]===undefined) {

                __notifications[code] = code;

                var options = {
                    cache : true,
                    params : {
                        q : "schema_s:notification AND symbol_s:"+code,
                        fl : "symbol_?,reference_?,title_?,date_*,url_*",
                        rows: 1
                    }
                 };

                $http.get("/api/v2013/index", options).then(function(res){

                    var results = res.data.response;
                    __notifications[code] = results.numFound ? results.docs[0] : null;

                    return __notifications[code];
                });
            }

            return __notifications[code];
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
                        console.log(res.value);

                        if(res.value=="$escape")      delete res.value;
                        if(res.value=="$document")    delete res.value;
                        if(res.value=="$closeButton") delete res.value;

                        return res;
                    });

                    resolve(dialog);

                }, reject);
            });
        }
    }];

    var getComputedDisplay = (typeof window.getComputedStyle != "undefined") ?
    function(el) {
        return window.getComputedStyle(el, null).display;
    } :
    function(el) {
        return el.currentStyle.display;
    };

    function replaceWithOwnChildren(el) {
        var parent = el.parentNode;
        while (el.hasChildNodes()) {
            parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
    }

    function removeSelectionFormatting() {
        var range, sel = rangy.getSelection();

        if(sel.isCollapsed)
            return;

        for (var r = 0; r < sel.rangeCount; ++r) {

            var commonAncestor = $(sel.getRangeAt(r).commonAncestorContainer);

            if(!commonAncestor.is("#content") && !commonAncestor.parents('#content').size()) {
                alert('Please select text only from the decision');
                return;
            }
        }

        for (var i = 0; i < sel.rangeCount; ++i) {
            range = sel.getRangeAt(i);

            // Split partially selected nodes
            range.splitBoundaries();

            // Get formatting elements. For this example, we'll count any
            // element with display: inline, except <br>s.
            var formattingEls = range.getNodes([1], function(el) {
                return el.tagName != "BR";// && getComputedDisplay(el) == "inline";
            });

            // Remove the formatting elements
            for (var j = 0; j<formattingEls.length; j++) {
                replaceWithOwnChildren(formattingEls[j]);
            }
        }
    }
});

(function(){

    var cache = [0],
        expando = 'data' +new Date();

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
