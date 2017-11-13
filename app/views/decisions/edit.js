define(['lodash', 'angular', 'require', 'rangy', 'jquery', './data/romans', './data/sections', './data/paragraphes', './data/items', './data/sub-items', './data/actors', './data/statuses', 'ngDialog', 'authentication', 'filters/moment', 'filters/lodash', 'filters/lstring', './directives/notification', './directives/meeting-document', './directives/meeting'],
function(_, ng, require, rangy, $, roman, sectionList, paragraphList, itemList, subItemList, actorList, statusesList) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', 'ngDialog', function($scope, $http, $route, $location, $filter, $q, ngDialog) {

        var treaty        = null;
        var body          = $route.current.params.body.toUpperCase();
        var session       = parseInt($route.current.params.session);
        var decision      = parseInt($route.current.params.decision);
        var selectedElement = null;

             if(body=='COP') treaty = { code : "XXVII8" } ;
    //  else if(body=='CP')  treaty = "XXVII8a";
    //  else if(body=='NP')  treaty = "XXVII8b";

        if(!treaty) {
            alert('ONLY "COP" DECISIONS ARE SUPPORTED');
            throw 'ONLY "COP" DECISIONS ARE SUPPORTED';
        }

        if(!_.isFinite(session)  || session <1) { $scope.paramError = "session_invalid";  return this; }
        if(!_.isFinite(decision) || decision<1) { $scope.paramError = "decision_invalid"; return this; }

        var data = { content: 'loading...' };

        $scope.symbol =
        $scope.close  = close;
        $scope.save   = save;
        $scope.upload = upload;
        $scope.buildFileUrl = buildFileUrl;
        $scope.deleteFile = deleteFile;
        $scope.selectActors = selectActors;
        $scope.deleteActor  = deleteActor;
        $scope.selectStatuses = selectStatuses;
        $scope.deleteStatus   = deleteStatus;
        $scope.selectDecision = selectDecision;
        $scope.deleteDecision = deleteDecision;
        $scope.selectMeeting  = selectMeeting;
        $scope.deleteMeeting  = deleteMeeting;
        $scope.selectMeetingDocument = selectMeetingDocument;
        $scope.deleteMeetingDocument = deleteMeetingDocument;
        $scope.selectNotification = selectNotification;
        $scope.deleteNotification = deleteNotification;
        $scope.actionEdit  = edit;
        $scope.isEditable  = isEditable;
        $scope.tag         = tag;
        $scope.actionBox   = surroundSelection;
        $scope.actionUnbox = unsurroundSelection;
        $scope.actionClean = removeSelectionFormatting;
        $scope.collections = {
            sections    : sectionList,
            paragraphes : paragraphList,
            items       : itemList,
            subItems    : subItemList,
            actorsMap   : _(actorList   ).reduce(function(r,v){ r[v.code] = v; return r; }, {}),
            statusesMap : _(statusesList).reduce(function(r,v){ r[v.code] = v; return r; }, {})
        };

        $scope.selectedActor = '';
        $scope.selectedStatus = '';

        load();

        return this;

        //************************************************************
        //************************************************************
        //************************************************************
        //************************************************************

        //==============================
        //
        //==============================
        function close() {
            $location.url(('/'+body+'/'+session+'/'+decision).toLowerCase());
        }


        //===========================
        //
        //===========================
        function load() {

            $http.get('/api/v2015/treaties/'+treaty.code, { cache: true } ).then(function(res) {

                treaty = res.data;

                return $http.get('/api/v2016/decision-texts', { params : { q : { $or: [{ decision: roman[session] + '/' + decision}, { treaty:treaty.code,  body: body, session: session, decision: decision }]}, fo: 1 }});

            }).then(function(res){

                data = res.data || {
                    treaty  : treaty.code,
                    body    : body,
                    session : session,
                    decision: decision,
                    meeting : body+'-'+ pad(session),
                    content: 'paste here'
                };

                data = _.defaults(data, {
                    symbol : data.decision,
                    body   : body,
                    treaty : treaty.code
                });

                if(typeof(data.decision)=='string') {
                    data.decision = parseInt(data.symbol.replace(/.*\/(\d+)$/, '$1'));
                }

                $('#content').html(data.content);

                clean($('#content')[0]);
                clean($('#content')[0]);
                clean($('#content')[0]);

                $('#content,element').mousedown(mousedown_selectNode);

            }).then(function(){

                lazyRetag();

            }).catch(function(err){

                err = (err||{}).data || err;

                console.error(err);

                if(err.status==403)
                    $location.url('/403?returnurl='+encodeURIComponent($location.url()));

                alert(err.message||err);
            });
        }

        function lazyRetag(paragraphes) {
            if(paragraphes && paragraphes.length==0) {
                selectNode(null);
                return;
            }

            paragraphes = paragraphes || $('#content element').toArray();

            var el = paragraphes.shift();

            $scope.$applyAsync(function(){ selectNode(el);         });
            $scope.$applyAsync(function(){ tag();                  });
            $scope.$applyAsync(function(){ lazyRetag(paragraphes); });
        }


        //===========================
        //
        //===========================
        function save() {

            var selectedNode = selectedElement;

            selectNode(null);

            //Cleanup data;

            $('#content element').each(function() {
                var info = $(this).data('info');

                if(info && info.type!='paragraph') {
                    delete info.data;
                    $(this).attr('data-info', ng.toJson(info));
                }
            });

            // Save

            data.content = $('#content').html();

            var req = {
                method : data._id ? 'PUT' : 'POST',
                url    : '/api/v2016/decision-texts' + (data._id ? '/'+data._id : ''),
                data   : _.pick(data, "_id","treaty","body","session","decision","meeting","content")
            };


            $http(req).then(function(res){

                data._id = data._id || res.data._id;

                selectNode(selectedNode);

                alert( "Your document has been successfully saved." );

            }).catch(function(err){

                err = (err||{}).data || err;

                console.error(err);

                alert(err.message||JSON.stringify(err, null, ' '));
            });
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

        //==============================
        //
        //==============================
        function pad(input) {

            var output = (input || '').toString();

            while(output.length<2)
                output = '0' + output;

            return output;
        }

        //===========================
        //
        //===========================
        function tag() {

            if(!selectedElement) return;
            if(!$scope.element)  return;

            var element = $scope.element;

            element.section   = element.type=='paragraph' ? (element.section  || undefined) : undefined;
            element.paragraph = element.type=='paragraph' ? (element.paragraph|| undefined) : undefined;
            element.item      = element.type=='paragraph' ? (element.item     || undefined) : undefined;
            element.subitem   = element.type=='paragraph' ? (element.subitem  || undefined) : undefined;

            var data = element.data = element.data || { };

            data.section   = element.section   && element.section.toUpperCase();
            data.paragraph = element.paragraph && parseInt(element.paragraph);
            data.item      = element.item      && element.item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
            data.subitem   = element.subitem   && roman.indexOf(element.subitem.toUpperCase());

            // tag
            var tag = element.type || '';

            if(element.section)   tag += ' ' + element.section;
            if(element.paragraph) tag += ' ' + element.paragraph;
            if(element.item)      tag += ''  + element.item;
            if(element.subitem)   tag += ' (' + element.subitem + ')';

            if(tag) $(selectedElement).attr('data-type', tag);
            else    $(selectedElement).removeAttr('data-type');

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

            $(span).mousedown(mousedown_selectNode);

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
        function selectNode(node) {

            delete $scope.formattingLocked;

            $(selectedElement).attr('data-info', ng.toJson($scope.element));

            $(selectedElement).removeClass('selected');

            delete $scope.element;

            selectedElement = node;

            if(!selectedElement)
                return;

            $(selectedElement).addClass('selected');

            $scope.element = $(selectedElement).data('info') || {};

            if(($scope.element.data||{}).type == 'information')
                $scope.element.data.type = 'informational';

            if($scope.element.data) {
                $scope.element.data.statusInfo = $scope.element.data.statusInfo || $scope.element.elementStatusDetails;
                delete $scope.element.elementStatusDetails;
            }

            $scope.formattingLocked = !!$scope.element.type;
        }

        //===========================
        //
        //===========================
        function mousedown_selectNode(event) {

            var node = this; // jshint ignore: line

            event.stopPropagation();

            $scope.$applyAsync(function(){
                selectNode(node);
            });
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

        ////////////////////
        // FILES
        ////////////////////

        //===========================
        //
        //===========================
        function upload() {

            var fileUpload = $('<input type="file" accept="application/pdf" multiple="" style="display:none">');

            $("ng-view").append(fileUpload);

            fileUpload.bind("change", function(){
                _.forEach(this.files, uploadFile);
            });

            fileUpload.click();
        }

        //===========================
        //
        //===========================
        function uploadFile(file) {

            if(!file)
                return;

            var fileInfo = {
                filename : file.name.toLowerCase(),
                size : file.size
            };

            $scope.uploads = $scope.uploads || [];
            $scope.uploads.push(fileInfo);

            var postData = {
                filename : file.name,
                metadata : {
                    source  : 'dtt',
                    paragraph : $scope.element.data.code
                }
            };

            return $http.post('/api/v2015/temporary-files', postData).then(resData).then(function(target) {

                return $http.put(target.url, file, { headers : { 'Content-Type' : target.contentType } }).then(function(){
                    return target;
                });

            }).then(function(target) {

                return $http.get('/api/v2015/temporary-files/'+target.uid).then(resData);

            }).then(function(meta) {

                // fileInfo.url         = 'upload://'+meta.uid;  // TODO: Use upload://{uid} instead of hash
                fileInfo.filename    = meta.filename;
                fileInfo.contentType = meta.contentType;
                fileInfo.size        = meta.size;
                fileInfo.hash        = meta.hash;

                var index;

                while(~(index = $scope.uploads.indexOf(fileInfo)))
                    $scope.uploads.splice(index, 1);

                $scope.element.data.files = $scope.element.data.files||[];
                $scope.element.data.files.push(fileInfo);

            }).catch(function(err) {

                console.error((err||{}).message || err);

                fileInfo.error = (err||{}).data || err;

            });
        }

        //===========================
        //
        //===========================
        function buildFileUrl(item) {
            return '/api/v2016/decision-texts/'+data._id+'/attachments/'+item.hash+'/stream';
        }

        //===========================
        //
        //===========================
        function deleteFile(item) {

            if(!$scope.element && !$scope.element.data)
                return;

            var items = $scope.element.data.files || [];
            var index = items.indexOf(item);

            if(index>=0) {
                items.splice(index, 1);
            }

            $scope.element.data.files = items.length ? items : undefined;
        }

        ////////////////////
        // DOCUMENTS
        ////////////////////

        //===========================
        //
        //===========================
        function selectMeetingDocument() {

            openDialog('./select-document-dialog', { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    $scope.element.data.documents = _.union($scope.element.data.documents||[], [res.value]);
                });
            });
        }

        //===========================
        //
        //===========================
        function deleteMeetingDocument(item) {

            if(!$scope.element && !$scope.element.data)
                return;

            var items = $scope.element.data.documents || [];
            var index = items.indexOf(item);

            if(index>=0) {
                items.splice(index, 1);
            }

            $scope.element.data.documents = items.length ? items : undefined;
        }

        ////////////////////
        // DIALOGS
        ////////////////////

        //===========================
        //
        //===========================
        function selectActors() {

            if($scope.selectedActor && !~($scope.element.data.actors||[]).indexOf($scope.selectedActor)) {
                $scope.element.data.actors.push($scope.selectedActor);
            }

            $scope.selectedActor = '';
        }

        //===========================
        //
        //===========================
        function deleteActor(item) {

            if(!$scope.element && !$scope.element.data)
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

            if($scope.selectedStatus && !~($scope.element.data.statuses||[]).indexOf($scope.selectedStatus)) {
                $scope.element.data.statuses.push($scope.selectedStatus);
            }

            $scope.selectedStatus = '';
        }

        //===========================
        //
        //===========================
        function deleteStatus(item) {

            if(!$scope.element && !$scope.element.data)
                return;

            var index, items = $scope.element.data.statuses || [];

            while((index=items.indexOf(item))>=0)
                items.splice(index, 1);

            if(!items.length)
                $scope.element.data.statuses = undefined;
        }

        //===========================
        //
        //===========================
        function selectDecision() {

            openDialog('./select-decision-dialog', { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    $scope.element.data.decisions = $scope.element.data.decisions || [];
                    $scope.element.data.decisions.push(res.value);

                    $scope.element.data.decisions = _.uniq($scope.element.data.decisions);
                });
            });
        }

        //===========================
        //
        //===========================
        function deleteDecision(item) {

            if(!$scope.element && !$scope.element.data)
                return;

            var index, items = $scope.element.data.decisions || [];

            while((index=items.indexOf(item))>=0)
                items.splice(index, 1);

            if(!items.length)
                $scope.element.data.decisions = undefined;
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

            if(!$scope.element && !$scope.element.data)
                return;

            var index, items = $scope.element.data.notifications || [];

            while((index=items.indexOf(item))>=0)
                items.splice(index, 1);

            if(!items.length)
                $scope.element.data.notifications = undefined;
        }

        //===========================
        //
        //===========================
        function selectMeeting() {

            openDialog('./select-meeting-dialog', { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    $scope.element.data.meetings = $scope.element.data.meetings || [];
                    $scope.element.data.meetings.push(res.value.symbol);
                });
            });
        }

        //===========================
        //
        //===========================
        function deleteMeeting(item) {

            if(!$scope.element && !$scope.element.data)
                return;

            var index, items = $scope.element.data.meetings || [];

            while((index=items.indexOf(item))>=0)
                items.splice(index, 1);

            if(!items.length)
                $scope.element.data.meetings = undefined;
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
                        if(res.value=="$document")    delete res.value;
                        if(res.value=="$closeButton") delete res.value;

                        return res;
                    });

                    resolve(dialog);

                }, reject);
            });
        }
    }];

    //===========================
    //
    //===========================
    function replaceWithOwnChildren(el) {
        var parent = el.parentNode;
        while (el.hasChildNodes()) {
            parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
    }

    //===========================
    //
    //===========================
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
                return el.tagName != "BR";
            });

            // Remove the formatting elements
            for (var j = 0; j<formattingEls.length; j++) {
                replaceWithOwnChildren(formattingEls[j]);
            }
        }
    }

    //===========================
    //
    //===========================
    function resData(res) {
        return res.data;
    }

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
