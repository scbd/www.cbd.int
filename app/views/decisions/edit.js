import 'ngDialog'
import '~/authentication'
import '~/filters/moment'
import '~/filters/lodash'
import '~/filters/lstring'
import '~/directives/comments/internal-comments'
import './directives/notification'
import './directives/meeting-document'
import './directives/meeting'
import './directives/decision-reference'
import _       from 'lodash'
import ng      from 'angular'
import rangy   from 'rangy'
import $       from 'jquery'
import roman         from './data/romans'
import sectionList   from './data/sections'
import paragraphList from './data/paragraphes'
import itemList      from './data/items'
import subItemList   from './data/sub-items'
import actorList     from './data/actors'
import statusesList  from './data/statuses'
import DecisionEdit from '~/views/decisions/decision-edit.vue';
import DecisionApi from '~/api/decisions.js';
import 'angular-vue'

export { default as template } from './edit.html'

export default ['$scope', '$http', '$route', '$location', '$filter', '$q', '$compile', 'ngDialog', 'user', '$anchorScroll','apiToken', function($scope, $http, $route, $location, $filter, $q, $compile, ngDialog, user, $anchorScroll, apiToken) {

        $scope.tokenReader = function(){ return apiToken.get()}
        $scope.route       = { params : $route.current.params, query: $location.search() }
        $scope.vueOptions = {
            components : {DecisionEdit}
        };
        $scope.api = new DecisionApi($scope.tokenReader);

        var treaty        = null;
        var body          = $route.current.params.body.toUpperCase();
        var session       = parseInt($route.current.params.session);
        var decision      = parseInt($route.current.params.decision);
        var selectedElement = null;

        $scope.selectedNode = null;

        $scope.$watch("selectedNode", (newNode, oldNoe)=>{
            if(newNode) {
                const {section, paragraph, item, subitem} = newNode;
                let element = {};
                element.type = paragraph && `paragraph`;
                element.section = section && `${section}`;
                element.paragraph = paragraph && `${paragraph}`;
                element.item = item && `${item}`;
                element.subitem = subitem && `${subitem}`;
                element.data = newNode;
                $scope.element = element;
            }
        });

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

        $scope.self    = $scope;
        $scope.canEdit = canEdit();
        $scope.canView = canView();
        $scope.canDebug = canDebug();
        $scope.user   = _.pick(user, ['userID', 'name']);
        $scope.close  = close;
        $scope.save   = save;
        $scope.upload = upload;
        $scope.comments    = {};
        $scope.commentResources = [];
        $scope.buildFileUrl = buildFileUrl;
        $scope.selectDecision = selectDecision;
        $scope.selectMeeting  = selectMeeting;
        $scope.selectMeetingDocument = selectMeetingDocument;
        $scope.selectNotification = selectNotification;
        $scope.actionEdit  = edit;
        $scope.isEditable  = isEditable;
        $scope.tag         = tag;
        $scope.actionBox   = surroundSelection;
        $scope.actionUnbox = unsurroundSelection;
        $scope.actionClean = removeSelectionFormatting;
        $scope.jumpTo      = jumpTo;
        $scope.initials=function(t) { return _.startCase(t).replace(/[^A-Z]/g, ''); };
        $scope.addTo       = addTo;
        $scope.removeFrom  = removeFrom;
        $scope.element = {};

        $scope.noNarrower = function(t) { return !t.narrowerTerms || !t.narrowerTerms.length; };
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
        
        $scope.$on('comments', loadComments);

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

            var q0 = $http.get('/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms',  { cache: true } );
            var q1 = $http.get('/api/v2013/thesaurus/domains/AICHI-TARGETS/terms', { cache: true } );
            var q2 = $http.get('/api/v2015/treaties/'+ encodeURIComponent(treaty.code), { cache: true } );

            $q.all([q0, q1, q2]).then(function(res) {

                $scope.collections.subjects        =   res[0].data;
                $scope.collections.aichiTargets    =   res[1].data;
                $scope.collections.subjectsMap     = _(res[0].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});
                $scope.collections.aichiTargetsMap = _(res[1].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});

                treaty   = res[2].data;

                //TODO - remove or pass this decision to decision-edit
                const code = treaty.acronym+'/'+body+'/'+pad(session)+'/'+pad(decision);
                $scope.api.queryDecisionTree(code).then((d) => {
                    $scope.decision = d;
                    $scope.subjects = (d.subjects|| []);
                    $scope.aichiTargets = (d.aichiTargets || []);
                });
                
                return $http.get('/api/v2016/decision-texts', { params : { q : { $or: [{ decision: roman[session] + '/' + decision}, { treaty:treaty.code,  body: body, session: session, decision: decision }]}, fo: 1 }});

            }).then(function(res){

                data = res.data || {
                    treaty  : treaty.code,
                    body    : body,
                    session : session,
                    decision: decision,
                    meeting : body+'-'+ pad(session),
                    subjects : [],
                    aichiTargets : [],
                    content: 'paste here'
                };

                data = _.defaults(data, {
                    symbol : data.decision,
                    body   : body,
                    treaty : treaty.code,
                    subjects : [],
                    aichiTargets : []
                });

                if(typeof(data.decision)=='string') {
                    data.decision = parseInt(data.symbol.replace(/.*\/(\d+)$/, '$1'));
                }

                // $scope.subjects     = data.subjects     = (data.subjects     || []);
                // $scope.aichiTargets = data.aichiTargets = (data.aichiTargets || []);

                // $('#content').html(data.content);


                // clean($('#content')[0]);
                // clean($('#content')[0]);
                // clean($('#content')[0]);

                // $('#content,element').mousedown(mousedown_selectNode);

            }).then(function(){

                lazyRetag();
                loadComments();

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

        async function save() {
            if(!canEdit()) {
                alert("Unauthorized to save");
                throw new Error("unauthorized to save");
            }

            const {selectedNode, element, decision} = $scope;

            if(decision) {
                // console.log(JSON.stringify(decision));
                // const {_id} = decision;
                // decision.subjects = $scope.subjects;
                // decision.aichiTargets = $scope.aichiTargets;
                // const result = await $scope.api.updateDecisionNode(_id, _id, decision);
                // console.log(result);
                // alert( "Your document has been successfully saved." );
            }

            if(selectedNode) {
                const {decisionId, _id} = selectedNode;

                const newNode = {...selectedNode};
                const {section, paragraph, item, subitem} = element;

                newNode.section = section && ((sectionList.find(s => s.code === section) || {}).value || section);
                newNode.paragraph = paragraph && ((paragraphList.find(s => s.code === paragraph) || {}).value || paragraph);
                newNode.item = item && ((itemList.find(s => s.code === item) || {}).value || item);
                newNode.subitem = subitem && ((subItemList.find(s => s.code === subitem) || {}).value || subitem);

                const result = await $scope.api.updateDecisionNode(decisionId, _id, newNode);

                console.log(decisionId, _id, result);
                alert( "Your document has been successfully saved." );
            } 
            
            
        }

        //TODO - remove
        // function save() {
        //     if(!canEdit()) {
        //         alert("Unauthorized to save");
        //         throw new Error("unauthorized to save");
        //     }

        //     var selectedNode = selectedElement;

        //     selectNode(null);

        //     //Cleanup data;

        //     clearCommentButton();

        //     $('#content element').each(function() {
        //         var info = $(this).data('info');

        //         if(info && info.type!='paragraph') {
        //             delete info.data;
        //             $(this).attr('data-info', ng.toJson(info));
        //         }
        //     });

        //     // Save

        //     data.content = $('#content').html();

        //     updateCommentButton();

        //     var req = {
        //         method : data._id ? 'PUT' : 'POST',
        //         url    : '/api/v2016/decision-texts' + (data._id ? '/'+data._id : ''),
        //         data   : _.pick(data, "_id","treaty","body","session","decision","meeting","content","subjects","aichiTargets")
        //     };


        //     $http(req).then(function(res){

        //         data._id = data._id || res.data._id;

        //         selectNode(selectedNode);

        //         alert( "Your document has been successfully saved." );

        //     }).catch(function(err){

        //         err = (err||{}).data || err;

        //         console.error(err);

        //         alert(err.message||JSON.stringify(err, null, ' '));
        //     });
        // }

        //===========================
        //
        //===========================
        function loadComments() {
            return $http.get('/api/v2017/comments', { params : { q: { type:'decision', resources: data.code } } }).then(function(res){

                var comments = res.data;

                $scope.comments = {};

                comments.forEach(function(comment){
                    comment.resources.forEach(function(key){
                        $scope.comments[key] = $scope.comments[key]||[];
                        $scope.comments[key].push(comment);
                    });
                });

                updateCommentButton();

            }).catch(console.error);
        }
        
        updateCommentButton();

        //===========================
        //
        //===========================
        function clearCommentButton() {
            ng.element('#content button.comment').remove();
        }

        //===========================
        //
        //===========================
        function updateCommentButton() {

            clearCommentButton();

            $scope.$applyAsync(function(){

                ng.element('#content element[data-type^=paragraph]').each(function(){

                    var $this = ng.element(this);
                    var info =  $this.data('info');
                    var btn   = $compile('<button class="btn btn-link comment" ng-click="jumpTo(\'comment\')"><span class="fa fa-comment-o"></span><span class="fa fa-comments-o"></span></button>')($scope);

                    if(($scope.comments[info.code]||[]).length)
                        btn.addClass('has-comments');

                    $this.append(btn);
                });

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
            
            updateCommentButton();
        }

        //===========================
        //
        //===========================
        function surroundSelection(tag) {

            var range = window.getSelection().getRangeAt(0);

            var commonAncestor = $(range.commonAncestorContainer);

            if(!commonAncestor.is("#content") && !commonAncestor.parents('#content').length) {
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

            $(selectedElement).attr('data-info', ng.toJson(cleanup($scope.element, true)));

            $(selectedElement).removeClass('selected');

            delete $scope.element;

            selectedElement = node;

            if(!selectedElement) {
                $scope.commentResources = [];
                return;
            }

            $(selectedElement).addClass('selected');

            $scope.element = cleanup($(selectedElement).data('info') || {});

            if(($scope.element.data||{}).type == 'information')
                $scope.element.data.type = 'informational';

            if($scope.element.data) {
                $scope.element.data.statusInfo = $scope.element.data.statusInfo || $scope.element.elementStatusDetails;
                delete $scope.element.elementStatusDetails;
            }

            $scope.formattingLocked = !!$scope.element.type;
            $scope.commentResources = _.compact([data.code, $scope.element.code]);
        }

        //===========================
        //
        //===========================
        function cleanup(element, deleteEmpty) {

            if(element && element.data) {

                element.data.subjects      = _(element.data.subjects     ||[]).uniq().value();
                element.data.aichiTargets  = _(element.data.aichiTargets ||[]).uniq().value();
                element.data.actors        = _(element.data.actors       ||[]).uniq().value();
                element.data.statuses      = _(element.data.statuses     ||[]).uniq().value();
                element.data.decisions     = _(element.data.decisions    ||[]).uniq().value();
                element.data.notifications = _(element.data.notifications||[]).uniq().value();
                element.data.documents     = _(element.data.documents    ||[]).uniq().value();
                element.data.meetings      = _(element.data.meetings     ||[]).uniq().map(mettingUrlToCode).value();

                if(deleteEmpty) { // Remove empty fields/arrays

                    for(var key in element.data) {

                        var val = element.data[key];

                        if(val===undefined) { delete element.data[key]; continue; }
                        if(val===null)      { delete element.data[key]; continue; }
                        if(val==="")        { delete element.data[key]; continue; }

                        if(_.isArray(val) && !val.length) {
                            delete element.data[key]; continue;
                        }
                    }
                }
            }

            return element;
        }

        //===========================
        //
        //===========================
        function mettingUrlToCode(m) {

            var meetingUrlRE = /^https?:\/\/www.cbd.int\/meetings\/([a-zA-Z0-9\-]+)$/;

            if(meetingUrlRE.test(m))
                m = m.replace(meetingUrlRE, '$1');

            return m;
        }


        //===========================
        //
        //===========================
        function mousedown_selectNode(event) {

            var node = this; // jshint ignore: line

            event.stopPropagation();

            jumpTo('top');

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

        //===========================
        //
        //===========================
        function addTo(item, target) {

            if(!_.isArray(target)) throw new Error("target must be an array");

            if(target.indexOf(item) < 0)
                target.push(item);

            return target;
        }

        //===========================
        //
        //===========================
        function removeFrom(item, target) {

            if(!_.isArray(target)) throw new Error("target must be an array");

            var index;

            while((index = target.indexOf(item)) >= 0)
                target.splice(index, 1);

            return target;
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

        ////////////////////
        // DIALOGS
        ////////////////////

        //===========================
        //
        //===========================
        function selectMeetingDocument() {

            openDialog(import('./select-document-dialog'), { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    addTo(res.value, $scope.element.data.documents);
                });
            });
        }

        //===========================
        //
        //===========================
        function selectDecision() {

            openDialog(import('./select-decision-dialog'), { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    addTo(res.value, $scope.element.data.decisions);
                });
            });
        }

        //===========================
        //
        //===========================
        function selectNotification() {

            openDialog(import('./select-notification-dialog'), { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    addTo(res.value.symbol, $scope.element.data.notifications);
                });
            });
        }

        //===========================
        //
        //===========================
        function selectMeeting() {

            openDialog(import('./select-meeting-dialog'), { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    addTo(mettingUrlToCode(res.value.symbol), $scope.element.data.meetings);
                });
            });
        }

        //===========================
        //
        //===========================
        async function openDialog(dialog, options) {

            options = options || {};

            return $q.when(dialog).then(({ template, default: controller })=>{
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

                return dialog;
            });
        }

        function canDebug() { return !!_.intersection(user.roles, ["Administrator"]).length; }
        function canEdit()  { return !!_.intersection(user.roles, ["DecisionTrackingTool"]).length; }
        function canView()  { return !!_.intersection(user.roles, ["Administrator","DecisionTrackingTool", "ScbdStaff"]).length; }

        //==============================
        //
        //==============================
        function jumpTo(hash) {

            if(!hash)
                return;

            $scope.$applyAsync(function() {
                $anchorScroll(hash);
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

            if(!commonAncestor.is("#content") && !commonAncestor.parents('#content').length) {
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