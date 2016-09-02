define(['underscore', 'angular', 'require', 'rangy', 'jquery', './data/romans', './data/sections', './data/paragraphes', './data/items', './data/sub-items', './data/actors', './data/statuses', 'ngDialog', 'authentication', 'filters/moment', 'filters/lodash'],
function(_, ng, require, rangy, $, roman, sectionList, paragraphList, itemList, subItemList, actorList, statusesList) { 'use strict';

    return ['$scope', '$http', '$route', '$location', '$filter', '$q', 'ngDialog', function($scope, $http, $route, $location, $filter, $q, ngDialog) {

        var treaty = "CBD";
        var body   = "COP";
        var session  = parseInt($route.current.params.meeting);
        var decision = parseInt($route.current.params.number);
        var selectedElement = null;

        if(!_.isFinite(session)  || session <1) { $scope.paramError = "session_invalid";  return this; }
        if(!_.isFinite(decision) || decision<1) { $scope.paramError = "decision_invalid"; return this; }

        var data = { title: 'agenda', content: 'loading...' };

        $scope.symbol = roman[session] + '/' + decision;
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
        $scope.lookupMeeting  = lookupMeeting;
        $scope.selectMeetingDocument = selectMeetingDocument;
        $scope.deleteMeetingDocument = deleteMeetingDocument;
        $scope.lookupMeetingDocument = lookupMeetingDocument;
        $scope.selectNotification = selectNotification;
        $scope.deleteNotification = deleteNotification;
        $scope.lookupNotification = lookupNotification;
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

            $http.get('/api/v2016/decision-texts', { params : { q : { decision: $scope.symbol }, fo: 1 }}).then(function(res){

                data = res.data || { decision: $scope.symbol, content: 'paste here' };

                $('#content').html(data.content);

                clean($('#content')[0]);
                clean($('#content')[0]);
                clean($('#content')[0]);

                $('#content,element').mousedown(mousedown_selectNode);

            }).catch(function(err){

                err = (err||{}).data || err;

                console.error(err);

                if(err.status==403)
                    $location.url('/403?returnurl='+encodeURIComponent($location.url()));

                alert(err.message||err);
            });
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

            data.title = "agenda";
            data.content = $('#content').html();

            var req = {
                method : data._id ? 'PUT' : 'POST',
                url    : '/api/v2016/decision-texts' + (data._id ? '/'+data._id : ''),
                data   : data
            };

            $http(req).then(function(res){

                data._id = data._id || res.data.id;

                selectNode(selectedNode);

                alert( "Your document has been successfully saved." );

            }).catch(function(err){

                err = (err||{}).data || err;

                console.error(err);

                alert(err.message||err);
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

        //===========================
        //
        //===========================
        var __meetingDocument;
        function lookupMeetingDocument(code) {

            __meetingDocument = __meetingDocument||{};

            if(__meetingDocument[code]===undefined) {

                var isLink = /http[s]?:\/\//.test(code);

                __meetingDocument[code] = {
                    symbol_s : code,
                    url      : isLink ?  code  : undefined,
                    url_ss   : isLink ? [code] : []
                };

                if(!isLink) {

                    var options = {
                        cache : true,
                        params : {
                            q : "schema_s:meetingDocument AND symbol_s:"+solrEscape(code),
                            fl : "symbol_?,reference_?,title_?,date_*,url_*",
                            rows: 1
                        }
                     };

                    $http.get("/api/v2013/index", options).then(function(res){

                        var results = res.data.response;

                        if(results.numFound) {
                            __meetingDocument[code] = results.docs[0];

                            var url;
                            var urls = __meetingDocument[code].url_ss;

                            if(!url) url = _(urls).filter(function(u) { return /-en\.pdf$/.test(u); }).first();
                            if(!url) url = _(urls).filter(function(u) { return /-en\.doc$/.test(u); }).first();
                            if(!url) url = _(urls).filter(function(u) { return    /\.pdf$/.test(u); }).first();
                            if(!url) url = _(urls).filter(function(u) { return    /\.doc$/.test(u); }).first();
                            if(!url) url = _(urls).first();

                            __meetingDocument[code].url = url;
                        }

                        return __meetingDocument[code];
                    });
                }

            }

            return __meetingDocument[code];
        }

        ////////////////////
        // DIALOGS
        ////////////////////

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
        var __meetings;
        function lookupMeeting(code) {

            __meetings = __meetings||{};

            if(__meetings[code]===undefined) {

                __meetings[code] = code;

                var options = {
                    cache : true,
                    params : {
                        q : "schema_s:meeting AND symbol_s:"+code,
                        fl : "symbol_?,title_EN_t,eventCountry_EN_t,eventCity_EN_t,startDate_dt,endDate_dt,url_*",
                        rows: 1
                    }
                 };

                $http.get("/api/v2013/index", options).then(function(res){

                    var results = res.data.response;
                    __meetings[code] = results.numFound ? results.docs[0] : null;

                    return __meetings[code];
                });
            }

            return __meetings[code];
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
