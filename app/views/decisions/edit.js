define(['underscore', 'require', 'rangy', 'jquery', 'ngDialog', 'authentication'], function(_, require, rangy, $) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', 'ngDialog', function($scope, $http, $route, $location, $filter, $q, ngDialog) {
console.log(rangy);
        var data = { title: 'agenda', content: 'loading...' };

        $scope.symbol = $route.current.params.meeting + '/' + $route.current.params.number;
        $scope.save   = save;
        $scope.upload = upload;
        $scope.selectDecision = selectDecision;
        $scope.deleteDecision = deleteDecision;
        $scope.selectNotification = selectNotification;
        $scope.deleteNotification = deleteNotification;
        $scope.actionEdit  = edit;
        $scope.actionBox   = function(tag) { surroundSelection(tag); };
        $scope.actionUnbox = function()    { unsurroundSelection(); };
        $scope.actionClean = function()    { removeSelectionFormatting(); };
        $scope.element     = {};

        load();

        $scope.$watch('element.type', tag);
        $scope.$watch('element.paragraph', tag);
        $scope.$watch('element.item', tag);
        $scope.$watch('element.subitem', tag);

        $scope.onKeyDownResult = "";
        $scope.onKeyUpResult = "";
        $scope.onKeyPressResult = "";

        $scope.onKeyDown = function ($event) {
            $scope.onKeyDownResult = getKeyboardEventResult($event, "Key down");
        };

        $scope.onKeyUp = function ($event) {
            $scope.onKeyUpResult = getKeyboardEventResult($event, "Key up");
        };

        $scope.onKeyPress = function ($event) {

            if($event.keyCode==960) { autoParagraph(); $event.preventDefault(); $event.stopPropagation(); }

            $scope.onKeyPressResult = getKeyboardEventResult($event, "Key press");
        };

        return;

        //************************************************************
        //************************************************************
        //************************************************************
        //************************************************************

        function getKeyboardEventResult (keyEvent, keyEventDesc) {

            return keyEventDesc + " (keyCode: " + (window.event ? keyEvent.keyCode : keyEvent.which) + ")";
        }

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

        function autoParagraph() {

            if(!selectedElement) return alert('no selectedElement');

            var text   = $(selectedElement).text();
            var number = text.match(/^([0-9]+)\./);

            if(number) {
                $scope.element           = $scope.element || {};
                $scope.element.paragraph = number[1];
                $scope.element.type      = 'paragraph';
            }
        }

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

            // LINK TO DATA

            if($scope.element && $scope.element.type=='paragraph' && $scope.element.paragraph) {

                var meeting   = 9;//parseInt($route.current.params.meeting);
                var decision  = parseInt($route.current.params.number);
                var paragraph = parseInt($scope.element.paragraph);

                var meeting0   = (meeting  >9 ? '' : '0') + meeting;
                var decision0  = (decision >9 ? '' : '0') + decision;
                var paragraph0 = (paragraph>9 ? '' : '0') + paragraph;

                var code = 'CBD/COP/'+meeting0+'/'+decision0+'.'+$scope.element.section+paragraph0;

                console.log(code);

                if($scope.element.item) {

                    var item  = $scope.element.item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
                    var item0 = (item > 9 ? '' : '0') + item;

                    code += '.' + item0;
                }

                var array = _.where(decisionData, { code: code });

                if(array.length==1)
                    $scope.element.data = array[0];
            }

            // DONE

            $scope.$applyAsync();

            event.stopPropagation();
        }

        function tag() {

            if(selectedElement && $scope.element) {

                var tag = $scope.element.type || '';

                if($scope.element.section)   tag += ' ' + $scope.element.section;
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

                    $scope.element.notifications = $scope.element.notifications || [];
                    $scope.element.notifications.push(res.value);
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
        var sel = rangy.getSelection();

        if (!sel.isCollapsed) {
            for (var i = 0, range; i < sel.rangeCount; ++i) {
                range = sel.getRangeAt(i);

                // Split partially selected nodes
                range.splitBoundaries();

                // Get formatting elements. For this example, we'll count any
                // element with display: inline, except <br>s.
                var formattingEls = range.getNodes([1], function(el) {
                    return el.tagName != "BR";// && getComputedDisplay(el) == "inline";
                });

                // Remove the formatting elements
                for (var i = 0, el; el = formattingEls[i++]; ) {
                    replaceWithOwnChildren(el);
                }
            }
        }
    }
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

decisionData = [
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/01.01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-021",
			"2008-022",
			"2008-039"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/01.02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/01.03",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/01.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/01.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/01.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/01.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/01.08",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/01.09",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/01.10",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant international and regional organizations, local and indigenous communities, farmers, pastoralists and plant and animal breeders",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/01.11",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": [
			"2008-130"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/01.12",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/01.13",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/01.14",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 15,
		"code": "CBD/COP/09/01.15",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 16,
		"code": "CBD/COP/09/01.16",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 17.01,
		"code": "CBD/COP/09/01.17.01",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 17.02,
		"code": "CBD/COP/09/01.17.02",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 17.03,
		"code": "CBD/COP/09/01.17.03",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 18,
		"code": "CBD/COP/09/01.18",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": " indigenous and local communities, farmers, pastoralists, animal breeders, relevant organizations and other stakeholders",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 19,
		"code": "CBD/COP/09/01.19",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 20,
		"code": "CBD/COP/09/01.20",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 21.01,
		"code": "CBD/COP/09/01.21.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 21.02,
		"code": "CBD/COP/09/01.21.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 21.03,
		"code": "CBD/COP/09/01.21.03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 21.04,
		"code": "CBD/COP/09/01.21.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 21.05,
		"code": "CBD/COP/09/01.21.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 21.06,
		"code": "CBD/COP/09/01.21.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 22,
		"code": "CBD/COP/09/01.22",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 23,
		"code": "CBD/COP/09/01.23",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [
			"CBD/COP/15/05"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 24,
		"code": "CBD/COP/09/01.24",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO, and other relevant organizations and initiatives",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 25,
		"code": "CBD/COP/09/01.25",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "FAO, WHO, Bioversity International",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 26,
		"code": "CBD/COP/09/01.26",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 27,
		"code": "CBD/COP/09/01.27",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-130"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 28.01,
		"code": "CBD/COP/09/01.28.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 28.02,
		"code": "CBD/COP/09/01.28.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 28.03,
		"code": "CBD/COP/09/01.28.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 28.04,
		"code": "CBD/COP/09/01.28.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 29,
		"code": "CBD/COP/09/01.29",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO and other relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 30,
		"code": "CBD/COP/09/01.30",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 31,
		"code": "CBD/COP/09/01.31",
		"type": "information",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 32,
		"code": "CBD/COP/09/01.32",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 33,
		"code": "CBD/COP/09/01.33",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 34,
		"code": "CBD/COP/09/01.34",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 35,
		"code": "CBD/COP/09/01.35",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 36,
		"code": "CBD/COP/09/01.36",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO and other relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 37,
		"code": "CBD/COP/09/01.37",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 38,
		"code": "CBD/COP/09/01.38",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 39.01,
		"code": "CBD/COP/09/01.39.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 39.02,
		"code": "CBD/COP/09/01.39.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 1,
		"section": "",
		"paragraph": 40,
		"code": "CBD/COP/09/01.40",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/15"
		],
		"notifications": [
			"2008-130"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/02.01",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/02.02",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 3.01,
		"code": "CBD/COP/09/02.03.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-100"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 3.02,
		"code": "CBD/COP/09/02.03.02",
		"type": "operational",
		"statuses": [],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 3.03,
		"code": "CBD/COP/09/02.03.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/02.04",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/02.05",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "research community, relevant organizations",
		"decisions": [],
		"notifications": [
			"2008-100"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 6.01,
		"code": "CBD/COP/09/02.06.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 6.02,
		"code": "CBD/COP/09/02.06.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/02.07",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 8.01,
		"code": "CBD/COP/09/02.08.01",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant stakeholders and organizations",
		"decisions": [],
		"notifications": [
			"2008-100"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 8.02,
		"code": "CBD/COP/09/02.08.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant stakeholders and organizations",
		"decisions": [],
		"notifications": [
			"2008-100"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/02.09",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/02.10",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "private sector",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/02.11",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-100"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/02.12",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2009-116",
			"2009-117"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 2,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/02.13",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"SBSTTA"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-100",
			"2009-116",
			"2009-117"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 1.01,
		"code": "CBD/COP/09/03.01.01",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-034"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 1.02,
		"code": "CBD/COP/09/03.01.02",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 2.01,
		"code": "CBD/COP/09/03.02.01",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 2.02,
		"code": "CBD/COP/09/03.02.02",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/03.03",
		"type": "information",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2009-034",
			"2009-023",
			"2009-093"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/03.04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"SBSTTA"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2009-034",
			"2009-023",
			"2009-093"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/03.05",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"SBSTTA"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 6.01,
		"code": "CBD/COP/09/03.06.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 6.02,
		"code": "CBD/COP/09/03.06.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 6.03,
		"code": "CBD/COP/09/03.06.03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2009-112"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 6.04,
		"code": "CBD/COP/09/03.06.04",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 6.05,
		"code": "CBD/COP/09/03.06.05",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2009-023",
			"2009-044"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/03.07",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 3,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/03.08",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "donor and other organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 1,
		"code": "CBD/COP/09/04.A01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 2,
		"code": "CBD/COP/09/04.A02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "International Plant Protection Convention",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 3,
		"code": "CBD/COP/09/04.A03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "International Committee of the World Organization for Animal Health",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 4,
		"code": "CBD/COP/09/04.A04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Committee on Sanitary and Phytosanitary  Measures of the World Trade Organization",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 5,
		"code": "CBD/COP/09/04.A05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Committee on Fisheries of the Food and Agriculture Organization of the United Nations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 6,
		"code": "CBD/COP/09/04.A06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 7,
		"code": "CBD/COP/09/04.A07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 8,
		"code": "CBD/COP/09/04.A08",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": [
			"2008-127",
			"2009-137"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 9,
		"code": "CBD/COP/09/04.A09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-127",
			"2009-137"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 10,
		"code": "CBD/COP/09/04.A10",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"SBSTTA"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/SBSTTA/15/13"
		],
		"notifications": [
			"2008-127",
			"2009-137"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 11,
		"code": "CBD/COP/09/04.A11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 12,
		"code": "CBD/COP/09/04.A12",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "A",
		"paragraph": 13,
		"code": "CBD/COP/09/04.A13",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/27"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 1,
		"code": "CBD/COP/09/04.B01",
		"type": "information",
		"statuses": [
			"superseded",
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/23"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 2,
		"code": "CBD/COP/09/04.B02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 3,
		"code": "CBD/COP/09/04.B03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 4,
		"code": "CBD/COP/09/04.B04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "encourages other regions,…,invites ….and financial institutions",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 5,
		"code": "CBD/COP/09/04.B05",
		"type": "operational",
		"statuses": [
			"implemented",
			"elapsed"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "Global Invasive Species Programme",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 6,
		"code": "CBD/COP/09/04.B06",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2010-064"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 7,
		"code": "CBD/COP/09/04.B07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 8,
		"code": "CBD/COP/09/04.B08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 9,
		"code": "CBD/COP/09/04.B09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 10,
		"code": "CBD/COP/09/04.B10",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 11,
		"code": "CBD/COP/09/04.B11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 12,
		"code": "CBD/COP/09/04.B12",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 13,
		"code": "CBD/COP/09/04.B13",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 14,
		"code": "CBD/COP/09/04.B14",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 15,
		"code": "CBD/COP/09/04.B15",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/COP/15/27"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 16,
		"code": "CBD/COP/09/04.B16",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 17,
		"code": "CBD/COP/09/04.B17",
		"type": "operational",
		"statuses": [
			"implemented",
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 18,
		"code": "CBD/COP/09/04.B18",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "x",
		"paragraph": "x",
		"code": "CBD/COP/09/04.xx",
		"type": null,
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant organizations, including inter alia the International Convention for the Control and Management of Ships' Ballast Water and Sediments and the GloBallast Water Management programme, FAO, the International Council for the Exploration of the Sea, and the UNEP Regional Seas Programme",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 20,
		"code": "CBD/COP/09/04.B20",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 21,
		"code": "CBD/COP/09/04.B21",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "relevant organizations including ICAO and International Maritime Organization, and development assistance agencies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 22,
		"code": "CBD/COP/09/04.B22",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 23,
		"code": "CBD/COP/09/04.B23",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations, including GISP",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 24,
		"code": "CBD/COP/09/04.B24",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant research organizations",
		"decisions": [
			"CBD/COP/15/23"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 25,
		"code": "CBD/COP/09/04.B25",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 26,
		"code": "CBD/COP/09/04.B26",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 27,
		"code": "CBD/COP/09/04.B27",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 28,
		"code": "CBD/COP/09/04.B28",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 29,
		"code": "CBD/COP/09/04.B29",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "relevant international organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 4,
		"section": "B",
		"paragraph": 30,
		"code": "CBD/COP/09/04.B30",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "funding organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/05.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/SBSTTA/15/02",
			"CBD/SBSTTA/15/12"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/05.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant international and other organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.01,
		"code": "CBD/COP/09/05.03.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2009-058"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.02,
		"code": "CBD/COP/09/05.03.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.03,
		"code": "CBD/COP/09/05.03.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.04,
		"code": "CBD/COP/09/05.03.04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.05,
		"code": "CBD/COP/09/05.03.05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.06,
		"code": "CBD/COP/09/05.03.06",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.07,
		"code": "CBD/COP/09/05.03.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 5,
		"section": "",
		"paragraph": 3.08,
		"code": "CBD/COP/09/05.03.08",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/06.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/15"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/06.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/06.03",
		"type": "information",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/06.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/06.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "international organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/06.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2009-045",
			"2009-098"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/06.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/06.08",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/06.09",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/06.10",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/06.11",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/06.12",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/06.13",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Biotrade Initiative of UNCTAD",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/06.14",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 15,
		"code": "CBD/COP/09/06.15",
		"type": "operational",
		"statuses": [
			"implemented",
			"superseded"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "FAO, UNCTAD, UNEP, OECD and other national, regional, and international organizations and initiatives",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 6,
		"section": "",
		"paragraph": 16,
		"code": "CBD/COP/09/06.16",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant national, regional and international organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 1.01,
		"code": "CBD/COP/09/07.01.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 1.02,
		"code": "CBD/COP/09/07.01.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 1.03,
		"code": "CBD/COP/09/07.01.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 1.04,
		"code": "CBD/COP/09/07.01.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/COP/15/12"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 1.05,
		"code": "CBD/COP/09/07.01.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 2.01,
		"code": "CBD/COP/09/07.02.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 2.02,
		"code": "CBD/COP/09/07.02.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 2.03,
		"code": "CBD/COP/09/07.02.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 2.04,
		"code": "CBD/COP/09/07.02.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 2.05,
		"code": "CBD/COP/09/07.02.05",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 2.06,
		"code": "CBD/COP/09/07.02.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 2.07,
		"code": "CBD/COP/09/07.02.07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/07.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/07.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "UNESCO, Ramsar Convention on Wetlands",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 5.01,
		"code": "CBD/COP/09/07.05.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 5.02,
		"code": "CBD/COP/09/07.05.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 5.03,
		"code": "CBD/COP/09/07.05.03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 5.04,
		"code": "CBD/COP/09/07.05.04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/07.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations, including UNEP through its Ecosystem Management Programme",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 7,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/07.07",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF",
			"Others"
		],
		"actorsInfo": "other funding institutions and development agencies…… bilateral and multilateral donor agencies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/08.01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/08.02",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/08.03",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/08.04",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/08.05",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/08.06",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/08.07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-075",
			"2008-085"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/08.08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/08.09",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "other donor countries",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/08.10",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/08.11",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/08.12",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant implementing agencies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/08.13",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/08.14",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 15,
		"code": "CBD/COP/09/08.15",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 16.01,
		"code": "CBD/COP/09/08.16.01",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 16.02,
		"code": "CBD/COP/09/08.16.02",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 16.03,
		"code": "CBD/COP/09/08.16.03",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 17,
		"code": "CBD/COP/09/08.17",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-085"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 18.01,
		"code": "CBD/COP/09/08.18.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 18.02,
		"code": "CBD/COP/09/08.18.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 18.03,
		"code": "CBD/COP/09/08.18.03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 19,
		"code": "CBD/COP/09/08.19",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "including the \"One UN\" pilot countries",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 20,
		"code": "CBD/COP/09/08.20",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "UNEP, UNDP, FAO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 21,
		"code": "CBD/COP/09/08.21",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "all bilateral and multilateral development cooperation agencies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 22,
		"code": "CBD/COP/09/08.22",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 23,
		"code": "CBD/COP/09/08.23",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 24,
		"code": "CBD/COP/09/08.24",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 8,
		"section": "",
		"paragraph": 25,
		"code": "CBD/COP/09/08.25",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 9,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/09.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WGRI"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 9,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/09.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WGRI"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 9,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/09.03",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 9,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/09.04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"IPLC",
			"Others"
		],
		"actorsInfo": "observers, including scientific and academic bodies, indigenous and local communities and stakeholders",
		"decisions": [],
		"notifications": [
			"2008-076"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 9,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/09.05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"SBSTTA"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/SBSTTA/15/09",
			"CBD/COP/15/07"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 9,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/09.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 10,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/10.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 10,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/10.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 10,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/10.03",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 10,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/10.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 10,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/10.05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "2010 Biodiversity Indicators Partnership",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 10,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/10.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "organizations participating in the 2010 BIP",
		"decisions": [],
		"notifications": [
			"2008-099"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 10,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/10.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "organizations and relevant scientific bodies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 1,
		"code": "CBD/COP/09/11.A01",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 2,
		"code": "CBD/COP/09/11.A02",
		"type": "operational",
		"statuses": [
			"superseded",
			"active"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 3,
		"code": "CBD/COP/09/11.A03",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 4,
		"code": "CBD/COP/09/11.A04",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 5,
		"code": "CBD/COP/09/11.A05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 6,
		"code": "CBD/COP/09/11.A06",
		"type": "operational",
		"statuses": [
			"superseded",
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 7,
		"code": "CBD/COP/09/11.A07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"GEF",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 8,
		"code": "CBD/COP/09/11.A08",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "COP-MOP Kyoto Protocol",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 9,
		"code": "CBD/COP/09/11.A09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "A",
		"paragraph": 10,
		"code": "CBD/COP/09/11.A10",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 1,
		"code": "CBD/COP/09/11.B01",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 2,
		"code": "CBD/COP/09/11.B02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "relevant organizations, including United Nations development system, the World Bank, regional banks and all other relevant international and regional bodies, as well as non-governmental organizations and business sector entities",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 3,
		"code": "CBD/COP/09/11.B03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 4,
		"code": "CBD/COP/09/11.B04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"executive-secretary",
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 5,
		"code": "CBD/COP/09/11.B05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 6,
		"code": "CBD/COP/09/11.B06",
		"type": "operational",
		"statuses": [
			"implemented",
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 7,
		"code": "CBD/COP/09/11.B07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 8,
		"code": "CBD/COP/09/11.B08",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WGRI"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/08",
			"CBD/COP/15/03"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "B",
		"paragraph": 9,
		"code": "CBD/COP/09/11.B09",
		"type": "information",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WG8J"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/09",
			"CBD/COP/15/24",
			"CBD/COP/15/25"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "C",
		"paragraph": 1,
		"code": "CBD/COP/09/11.C01",
		"type": "information",
		"statuses": [
			"implemented",
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "C",
		"paragraph": 2,
		"code": "CBD/COP/09/11.C02",
		"type": "operational",
		"statuses": [
			"implemented",
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "COP 9 President ",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 11,
		"section": "C",
		"paragraph": 3,
		"code": "CBD/COP/09/11.C03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/10",
			"CBD/COP/15/24",
			"CBD/COP/15/25"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/12.01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/12.02",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"WGABS"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/19",
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/12.03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"WGABS"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/12.04",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/12.05",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"WGABS"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/12.06",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"WGABS"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/12.07",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"WGABS"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/12.08",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"WGABS"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/12.09",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "international organizations, relevant stakeholders",
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/12.10",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/12.11",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": [
			"2008-104"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/12.12",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/12.13",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": [
			"2008-168",
			"2009-011"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/12.14",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 15,
		"code": "CBD/COP/09/12.15",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 16,
		"code": "CBD/COP/09/12.16",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 17,
		"code": "CBD/COP/09/12.17",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "Co-Chairs of ABSWG …, ... and stakeholders…, ...donors",
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": [
			"2008-058"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 18,
		"code": "CBD/COP/09/12.18",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "international organizations and all relevant stakeholders",
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 19,
		"code": "CBD/COP/09/12.19",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "donors and other interested bodies",
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 20,
		"code": "CBD/COP/09/12.20",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary",
			"WG8J"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 21,
		"code": "CBD/COP/09/12.21",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 22,
		"code": "CBD/COP/09/12.22",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"other-governments",
			"Others"
		],
		"actorsInfo": "United Nations Environment Programme…and relevant intergovernmental organizations",
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 12,
		"section": "",
		"paragraph": 23,
		"code": "CBD/COP/09/12.23",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 1,
		"code": "CBD/COP/09/13.A01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 2,
		"code": "CBD/COP/09/13.A02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 3,
		"code": "CBD/COP/09/13.A03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 4,
		"code": "CBD/COP/09/13.A04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": [
			"2009-018"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 5,
		"code": "CBD/COP/09/13.A05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 6,
		"code": "CBD/COP/09/13.A06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 7,
		"code": "CBD/COP/09/13.A07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"IPLC",
			"Others"
		],
		"actorsInfo": "other relevant organizations",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 8,
		"code": "CBD/COP/09/13.A08",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"IPLC",
			"Others"
		],
		"actorsInfo": "international organizations….other stakeholders",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 9,
		"code": "CBD/COP/09/13.A09",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 10,
		"code": "CBD/COP/09/13.A10",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"executive-secretary",
			"IPLC"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 11,
		"code": "CBD/COP/09/13.A11",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "A",
		"paragraph": 12,
		"code": "CBD/COP/09/13.A12",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"WG8J"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 1,
		"code": "CBD/COP/09/13.B01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 2,
		"code": "CBD/COP/09/13.B02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant international organizations",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 3,
		"code": "CBD/COP/09/13.B03",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 4,
		"code": "CBD/COP/09/13.B04",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant international organizations",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 5,
		"code": "CBD/COP/09/13.B05",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "UNFCCC COP",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 6,
		"code": "CBD/COP/09/13.B06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 7,
		"code": "CBD/COP/09/13.B07",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 8,
		"code": "CBD/COP/09/13.B08",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "B",
		"paragraph": 9,
		"code": "CBD/COP/09/13.B09",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "C",
		"paragraph": 1,
		"code": "CBD/COP/09/13.C01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "international organizations",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "C",
		"paragraph": 2,
		"code": "CBD/COP/09/13.C02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "D",
		"paragraph": 1,
		"code": "CBD/COP/09/13.D01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "D",
		"paragraph": 2,
		"code": "CBD/COP/09/13.D02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "D",
		"paragraph": 3,
		"code": "CBD/COP/09/13.D03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF",
			"Others"
		],
		"actorsInfo": "other possible donors",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "D",
		"paragraph": 4,
		"code": "CBD/COP/09/13.D04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 1,
		"code": "CBD/COP/09/13.E01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 2,
		"code": "CBD/COP/09/13.E02",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 3,
		"code": "CBD/COP/09/13.E03",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 4,
		"code": "CBD/COP/09/13.E04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant funding institutions and mechanisms",
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 5,
		"code": "CBD/COP/09/13.E05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 6,
		"code": "CBD/COP/09/13.E06",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 7,
		"code": "CBD/COP/09/13.E07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": [
			"2008-088",
			"2008-093",
			"2008-094"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "E",
		"paragraph": 8,
		"code": "CBD/COP/09/13.E08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/40"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "F",
		"paragraph": 1,
		"code": "CBD/COP/09/13.F01",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/41"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "F",
		"paragraph": 2,
		"code": "CBD/COP/09/13.F02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/41"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "F",
		"paragraph": 3,
		"code": "CBD/COP/09/13.F03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/COP/15/41"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "F",
		"paragraph": 4,
		"code": "CBD/COP/09/13.F04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/41"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "F",
		"paragraph": 5,
		"code": "CBD/COP/09/13.F05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/41"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "F",
		"paragraph": 6,
		"code": "CBD/COP/09/13.F06",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/41"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "G",
		"paragraph": 1,
		"code": "CBD/COP/09/13.G01",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/42"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "G",
		"paragraph": 2,
		"code": "CBD/COP/09/13.G02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant international organizations and other relevant stakeholders",
		"decisions": [
			"CBD/COP/15/42"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "G",
		"paragraph": 3,
		"code": "CBD/COP/09/13.G03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/42"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "G",
		"paragraph": 4,
		"code": "CBD/COP/09/13.G04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/42"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "G",
		"paragraph": 5,
		"code": "CBD/COP/09/13.G05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WG8J"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/42"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 1,
		"code": "CBD/COP/09/13.H01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 2,
		"code": "CBD/COP/09/13.H02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 3,
		"code": "CBD/COP/09/13.H03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 4,
		"code": "CBD/COP/09/13.H04",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 5,
		"code": "CBD/COP/09/13.H05",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 6,
		"code": "CBD/COP/09/13.H06",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 7,
		"code": "CBD/COP/09/13.H07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 8,
		"code": "CBD/COP/09/13.H08",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": [
			"2009-003"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 9,
		"code": "CBD/COP/09/13.H09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WG8J"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "H",
		"paragraph": 10,
		"code": "CBD/COP/09/13.H10",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "I",
		"paragraph": 1,
		"code": "CBD/COP/09/13.I01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "I",
		"paragraph": 2,
		"code": "CBD/COP/09/13.I02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 13,
		"section": "I",
		"paragraph": 3,
		"code": "CBD/COP/09/13.I03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/43"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/14.01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/14.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/14.03",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/14.04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/14.05",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/14.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": [
			"2009-126"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/14.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WGRI"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/11",
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/14.08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/14.09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/14.10",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/14.11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant organizations and initiatives, research institutions at all levels, and non-governmental organizations",
		"decisions": [
			"CBD/WGRI/15/11",
			"CBD/COP/15/16"
		],
		"notifications": [
			"2009-126"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/14.12",
		"type": "operational",
		"statuses": [
			"implemented",
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/14.13",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/14.14",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 15,
		"code": "CBD/COP/09/14.15",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 16,
		"code": "CBD/COP/09/14.16",
		"type": "operational",
		"statuses": [
			"superseded",
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 14,
		"section": "",
		"paragraph": 17,
		"code": "CBD/COP/09/14.17",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/15.01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/15.02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant organizations, stakeholders",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 3.01,
		"code": "CBD/COP/09/15.03.01",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 3.02,
		"code": "CBD/COP/09/15.03.02",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 3.03,
		"code": "CBD/COP/09/15.03.03",
		"type": "information",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/15.04",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/15.05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/15.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant organizations…and stakeholders",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/15.07",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/15.08",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/15.09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WGRI"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/04"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/15.10",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations, scientists and other relevant stakeholders",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 15,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/15.11",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "A",
		"paragraph": 1,
		"code": "CBD/COP/09/16.A01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "A",
		"paragraph": 2,
		"code": "CBD/COP/09/16.A02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "A",
		"paragraph": 3,
		"code": "CBD/COP/09/16.A03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "A",
		"paragraph": 4,
		"code": "CBD/COP/09/16.A04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "A",
		"paragraph": 5,
		"code": "CBD/COP/09/16.A05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "donors and relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "A",
		"paragraph": 6,
		"code": "CBD/COP/09/16.A06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 1,
		"code": "CBD/COP/09/16.B01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 2,
		"code": "CBD/COP/09/16.B02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 3,
		"code": "CBD/COP/09/16.B03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 4,
		"code": "CBD/COP/09/16.B04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 5,
		"code": "CBD/COP/09/16.B05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 6,
		"code": "CBD/COP/09/16.B06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 7,
		"code": "CBD/COP/09/16.B07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "secretariats of the three Rio conventions",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 8,
		"code": "CBD/COP/09/16.B08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 9,
		"code": "CBD/COP/09/16.B09",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 10,
		"code": "CBD/COP/09/16.B10",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 11,
		"code": "CBD/COP/09/16.B11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "UNFCCC",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 12,
		"code": "CBD/COP/09/16.B12",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-091",
			"2008-109",
			"2008-114"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 13,
		"code": "CBD/COP/09/16.B13",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 14,
		"code": "CBD/COP/09/16.B14",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 15,
		"code": "CBD/COP/09/16.B15",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 16,
		"code": "CBD/COP/09/16.B16",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "B",
		"paragraph": 17,
		"code": "CBD/COP/09/16.B17",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "C",
		"paragraph": 1,
		"code": "CBD/COP/09/16.C01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "C",
		"paragraph": 2,
		"code": "CBD/COP/09/16.C02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "C",
		"paragraph": 3,
		"code": "CBD/COP/09/16.C03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "C",
		"paragraph": 4,
		"code": "CBD/COP/09/16.C04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "C",
		"paragraph": 5,
		"code": "CBD/COP/09/16.C05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "D",
		"paragraph": 1,
		"code": "CBD/COP/09/16.D01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Global Environment Centre",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "D",
		"paragraph": 2,
		"code": "CBD/COP/09/16.D02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "D",
		"paragraph": 3,
		"code": "CBD/COP/09/16.D03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "Scientific and Technical Review Panel of the Ramsar Convention",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "D",
		"paragraph": 4,
		"code": "CBD/COP/09/16.D04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"SBSTTA",
			"Others"
		],
		"actorsInfo": "Intergovernmental Panel on Climate Change",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "D",
		"paragraph": 5,
		"code": "CBD/COP/09/16.D05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 16,
		"section": "D",
		"paragraph": 6,
		"code": "CBD/COP/09/16.D06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Ramsar COP",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/17.01",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant organizations and donor agencies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/17.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/17.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/17.04",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/17.05",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/17.06",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/17.07",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/17.08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/17.09",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/02"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/17.10",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/17.11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/17.12",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/17.13",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/17.14",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 15,
		"code": "CBD/COP/09/17.15",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 16,
		"code": "CBD/COP/09/17.16",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 17,
		"section": "",
		"paragraph": 17,
		"code": "CBD/COP/09/17.17",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 1,
		"code": "CBD/COP/09/18.A01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 2,
		"code": "CBD/COP/09/18.A02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/24"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 3,
		"code": "CBD/COP/09/18.A03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 4,
		"code": "CBD/COP/09/18.A04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 5,
		"code": "CBD/COP/09/18.A05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 6,
		"code": "CBD/COP/09/18.A06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 7,
		"code": "CBD/COP/09/18.A07",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 8,
		"code": "CBD/COP/09/18.A08",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "UNEP-WCMC, IUCN-WCPA and other members of the World Database on Protected Areas (WDPA) Consortium",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 9,
		"code": "CBD/COP/09/18.A09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/COP/15/28"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 10,
		"code": "CBD/COP/09/18.A10",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 11,
		"code": "CBD/COP/09/18.A11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 12,
		"code": "CBD/COP/09/18.A12",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant intergovernmental organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 13,
		"code": "CBD/COP/09/18.A13",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "IUCN-WCPA and other relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 14,
		"code": "CBD/COP/09/18.A14",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 15,
		"code": "CBD/COP/09/18.A15",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "organizations and donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 16,
		"code": "CBD/COP/09/18.A16",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 17,
		"code": "CBD/COP/09/18.A17",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 18,
		"code": "CBD/COP/09/18.A18",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 19,
		"code": "CBD/COP/09/18.A19",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 20,
		"code": "CBD/COP/09/18.A20",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 21,
		"code": "CBD/COP/09/18.A21",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-124",
			"2009-053",
			"2009-079",
			"2009-170",
			"2010-109"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 22,
		"code": "CBD/COP/09/18.A22",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 23,
		"code": "CBD/COP/09/18.A23",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 24,
		"code": "CBD/COP/09/18.A24",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "IUCN",
		"decisions": [
			"CBD/SBSTTA/15/04",
			"CBD/COP/15/31"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "A",
		"paragraph": 25,
		"code": "CBD/COP/09/18.A25",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/SBSTTA/15/04",
			"CBD/COP/15/31"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 1,
		"code": "CBD/COP/09/18.B01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "international financial institutions…regional development banks and other multilateral financial institutions ",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 2,
		"code": "CBD/COP/09/18.B02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 3,
		"code": "CBD/COP/09/18.B03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 4,
		"code": "CBD/COP/09/18.B04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "donor countries",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 5,
		"code": "CBD/COP/09/18.B05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 6,
		"code": "CBD/COP/09/18.B06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "multilateral donors, non-governmental organizations and other funding organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 7,
		"code": "CBD/COP/09/18.B07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 8,
		"code": "CBD/COP/09/18.B08",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 9,
		"code": "CBD/COP/09/18.B09",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 10,
		"code": "CBD/COP/09/18.B10",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "COP President",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 18,
		"section": "B",
		"paragraph": 11,
		"code": "CBD/COP/09/18.B11",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-081"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 19,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/19.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Ramsar Convention",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 19,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/19.02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/27"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 19,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/19.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 19,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/19.04",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 19,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/19.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Ramsar Convention, UNEP-WCMC",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 19,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/19.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Ramsar Convention ",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 19,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/19.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Ramsar COP",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/20.01",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/24"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/20.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/20.03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/20.04",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/20.05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/20.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/20.07",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/21"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/20.08",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations, including in the context of the United Nationsl Ad Hoc Open-ended IWG",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/20.09",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/20.10",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/20.11",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "relevant organizations, including FAO, UNDOALAS, UNESCO-IOC and IMO",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/20.12",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/20.13",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/20.14",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 15,
		"code": "CBD/COP/09/20.15",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/29"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 16,
		"code": "CBD/COP/09/20.16",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 17,
		"code": "CBD/COP/09/20.17",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "FAO, and other relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 18,
		"code": "CBD/COP/09/20.18",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 19,
		"code": "CBD/COP/09/20.19",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-162",
			"2009-022",
			"2009-067"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 20,
		"code": "CBD/COP/09/20.20",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": [
			"2008-162",
			"2009-022",
			"2009-067"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 21,
		"code": "CBD/COP/09/20.21",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 22,
		"code": "CBD/COP/09/20.22",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 23,
		"code": "CBD/COP/09/20.23",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 24,
		"code": "CBD/COP/09/20.24",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 25,
		"code": "CBD/COP/09/20.25",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 26,
		"code": "CBD/COP/09/20.26",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 27,
		"code": "CBD/COP/09/20.27",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 20,
		"section": "",
		"paragraph": 28,
		"code": "CBD/COP/09/20.28",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-162",
			"2009-022",
			"2009-067"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/21.01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/01"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/21.02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/21.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/21.04",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2010-064"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/21.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/21.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/21.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/21.08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "donor countries, regional development banks and other financial institutions",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/21.09",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 21,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/21.10",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"SBSTTA"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/SBSTTA/15/03",
			"CBD/COP/15/15"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/22.01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "all organizations involved",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/22.02",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "BioNET-International and the Interim Steering Committee of the GTI Special Fund",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/22.03",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/22.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [
			"CBD/SBSTTA/15/14",
			"CBD/COP/15/39"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/22.05",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/22.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "international and funding organizations and other donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/22.07",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 22,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/22.08",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 23,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/23.01",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 23,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/23.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 23,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/23.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 23,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/23.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 24,
		"section": "",
		"paragraph": "",
		"code": "CBD/COP/09/24.0",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/19"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 25,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/25.01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 25,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/25.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 25,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/25.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 25,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/25.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "regional and international organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 25,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/25.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "regional and international organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 25,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/25.06",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 26,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/26.01",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 26,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/26.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 26,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/26.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "public and private institutions",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 26,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/26.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 26,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/26.05",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/27.01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/27.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"SBSTTA",
			"Others"
		],
		"actorsInfo": "scientific and technical bodies of the three Rio Conventions",
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/27.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "executive heads of the secretariats of CBD, CMS, CITES, Ramsar, WHC and ITPGRFA",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/27.04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Liaison Group of biodiversity-related conventions",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/27.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "scientific bodies of the biodiversity-related conventions and the Liaison Group of Biodiversity-related Conventions",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/27.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant scientific partners",
		"decisions": [],
		"notifications": [
			"2006-102"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/27.07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "Executive Director of UNEP",
		"decisions": [
			"CBD/COP/15/16"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/27.08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/27.09",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/27.10",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/27.11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/27.12",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 13,
		"code": "CBD/COP/09/27.13",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 27,
		"section": "",
		"paragraph": 14,
		"code": "CBD/COP/09/27.14",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "partner organizations and other organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 28,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/28.01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 28,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/28.02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 28,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/28.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 28,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/28.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "regional and international development agencies and banks",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 28,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/28.05",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "international development agencies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 28,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/28.06",
		"type": "operational",
		"statuses": [],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 1,
		"code": "CBD/COP/09/29.I01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 2,
		"code": "CBD/COP/09/29.I02",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 3,
		"code": "CBD/COP/09/29.I03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 4,
		"code": "CBD/COP/09/29.I04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 5,
		"code": "CBD/COP/09/29.I05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"executive-secretary",
			"SBSTTA",
			"Others"
		],
		"actorsInfo": "Bureau members, working groups, ad hoc technical expert groups",
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 6,
		"code": "CBD/COP/09/29.I06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 7,
		"code": "CBD/COP/09/29.I07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 8,
		"code": "CBD/COP/09/29.I08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 9,
		"code": "CBD/COP/09/29.I09",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 10,
		"code": "CBD/COP/09/29.I10",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 11,
		"code": "CBD/COP/09/29.I11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": [
			"2008-083",
			"2008-084"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 12,
		"code": "CBD/COP/09/29.I12",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": [
			"2008-083",
			"2008-084"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 13,
		"code": "CBD/COP/09/29.I13",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"SBSTTA"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10",
			"CBD/COP/15/13",
			"CBD/COP/15/11"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 14,
		"code": "CBD/COP/09/29.I14",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 15,
		"code": "CBD/COP/09/29.I15",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 16,
		"code": "CBD/COP/09/29.I16",
		"type": "operational",
		"statuses": [
			"implemented",
			"superseded"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "I",
		"paragraph": 17,
		"code": "CBD/COP/09/29.I17",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "V",
		"paragraph": 18,
		"code": "CBD/COP/09/29.V18",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/17",
			"CBD/COP/15/33",
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 29,
		"section": "V",
		"paragraph": 19,
		"code": "CBD/COP/09/29.V19",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary",
			"Others"
		],
		"actorsInfo": "other intergovernmental processes, United Nations agencies and non-governmental organizations",
		"decisions": [
			"CBD/COP/15/10"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 30,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/30.01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 30,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/30.02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 30,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/30.03",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "relevant partners holding biodiversity-related information",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 30,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/30.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant agencies and other donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 30,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/30.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 30,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/30.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/33"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 1,
		"code": "CBD/COP/09/31.A01",
		"type": "information",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 2,
		"code": "CBD/COP/09/31.A02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": [
			"2008-098"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.01,
		"code": "CBD/COP/09/31.A03.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.02,
		"code": "CBD/COP/09/31.A03.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.03,
		"code": "CBD/COP/09/31.A03.03",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.04,
		"code": "CBD/COP/09/31.A03.04",
		"type": "operational",
		"statuses": [
			"superseded"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.05,
		"code": "CBD/COP/09/31.A03.05",
		"type": "operational",
		"statuses": [
			"implemented",
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.06,
		"code": "CBD/COP/09/31.A03.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.07,
		"code": "CBD/COP/09/31.A03.07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 3.08,
		"code": "CBD/COP/09/31.A03.08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": "GEF Council",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 4,
		"code": "CBD/COP/09/31.A04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary",
			"GEF"
		],
		"actorsInfo": "GEF CEO and Director of the GEF Evaluation Office",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 5,
		"code": "CBD/COP/09/31.A05",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/10",
			"CBD/COP/15/24",
			"CBD/COP/15/26"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "A",
		"paragraph": 6,
		"code": "CBD/COP/09/31.A06",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/10",
			"CBD/COP/15/27"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "B",
		"paragraph": 1,
		"code": "CBD/COP/09/31.B01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "B",
		"paragraph": 2,
		"code": "CBD/COP/09/31.B02",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "B",
		"paragraph": 3,
		"code": "CBD/COP/09/31.B03",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "B",
		"paragraph": 4,
		"code": "CBD/COP/09/31.B04",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 1,
		"code": "CBD/COP/09/31.C01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/10",
			"CBD/COP/15/24"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 2,
		"code": "CBD/COP/09/31.C02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"WGRI"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/10",
			"CBD/COP/15/24"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 3,
		"code": "CBD/COP/09/31.C03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/WGRI/15/10",
			"CBD/COP/15/24"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 4,
		"code": "CBD/COP/09/31.C04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/02"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 5,
		"code": "CBD/COP/09/31.C05",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 6,
		"code": "CBD/COP/09/31.C06",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 7,
		"code": "CBD/COP/09/31.C07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 8,
		"code": "CBD/COP/09/31.C08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF",
			"Others"
		],
		"actorsInfo": "other donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 9,
		"code": "CBD/COP/09/31.C09",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "other donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 10,
		"code": "CBD/COP/09/31.C10",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF",
			"Others"
		],
		"actorsInfo": "other funding institutions and development agencies",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 11,
		"code": "CBD/COP/09/31.C11",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 12,
		"code": "CBD/COP/09/31.C12",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "funding organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 13,
		"code": "CBD/COP/09/31.C13",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"GEF",
			"Others"
		],
		"actorsInfo": "international financial institutions…regional development banks and other multilateral financial institutions",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 31,
		"section": "C",
		"paragraph": 14,
		"code": "CBD/COP/09/31.C14",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"GEF"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/32.01",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"IPLC",
			"Others"
		],
		"actorsInfo": "international organizations and other partners…non-governmental organizations and the private sector",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/32.02",
		"type": "information",
		"statuses": [
			"active"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/32.03",
		"type": "operational",
		"statuses": [
			"implemented",
			"superseded"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 4,
		"code": "CBD/COP/09/32.04",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "donors and relevant international organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 5,
		"code": "CBD/COP/09/32.05",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties",
			"other-governments",
			"Others"
		],
		"actorsInfo": "relevant organizations",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 6,
		"code": "CBD/COP/09/32.06",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 7,
		"code": "CBD/COP/09/32.07",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 8,
		"code": "CBD/COP/09/32.08",
		"type": "operational",
		"statuses": [
			"active"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 9,
		"code": "CBD/COP/09/32.09",
		"type": "operational",
		"statuses": [
			"elapsed"
		],
		"actors": [
			"parties",
			"IPLC",
			"Others"
		],
		"actorsInfo": "relevant international organizations and other partners",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 10,
		"code": "CBD/COP/09/32.10",
		"type": "operational",
		"statuses": [
			"implemented",
			"superseded"
		],
		"actors": [
			"parties"
		],
		"actorsInfo": null,
		"decisions": [
			"CBD/COP/15/19"
		],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 11,
		"code": "CBD/COP/09/32.11",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 32,
		"section": "",
		"paragraph": 12,
		"code": "CBD/COP/09/32.12",
		"type": "information",
		"statuses": [
			"implemented"
		],
		"actors": [
			"executive-secretary"
		],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 33,
		"section": "",
		"paragraph": 1,
		"code": "CBD/COP/09/33.01",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"Others"
		],
		"actorsInfo": "donors",
		"decisions": [],
		"notifications": []
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 33,
		"section": "",
		"paragraph": 2,
		"code": "CBD/COP/09/33.02",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [
			"parties",
			"Others"
		],
		"actorsInfo": "international organizations",
		"decisions": [],
		"notifications": [
			"2009-005"
		]
	},
	{
		"treaty": "CBD",
		"body": "COP",
		"session": 9,
		"decision": 33,
		"section": "",
		"paragraph": 3,
		"code": "CBD/COP/09/33.03",
		"type": "operational",
		"statuses": [
			"implemented"
		],
		"actors": [],
		"actorsInfo": null,
		"decisions": [],
		"notifications": []
	}
]
