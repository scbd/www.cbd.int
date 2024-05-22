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
import '~/directives/checkbox'
import _       from 'lodash'
import ng      from 'angular'
import $       from 'jquery'
import annexList     from './data/annexes'
import sectionList   from './data/sections'
import paragraphList from './data/paragraphes'
import itemList      from './data/items'
import subItemList   from './data/sub-items'
import actorList     from './data/actors'
import statusesList  from './data/statuses'
import EditElement from '~/components/decisions/edit-element.vue'
import DecisionApi from '~/api/decisions.js'
import areEquals from '~/filters/areEquals'
import 'angular-vue'

export { default as template } from './edit.html'

export default ['$scope', '$http', '$route', '$location', '$q', 'ngDialog', 'user', '$anchorScroll','apiToken', function($scope, $http, $route, $location, $q, ngDialog, user, $anchorScroll, apiToken) {

        $scope.vueOptions = {
            components : {EditElement}
        };
        $scope.api = new DecisionApi();
        $scope.decision = {};

        var treaty        = null;
        var body          = $route.current.params.body.toUpperCase();
        var session       = parseInt($route.current.params.session);
        var decision      = parseInt($route.current.params.decision);

        $scope.selectedNode = null;
        $scope.updateSelectedNode = updateSelectedNode;
        $scope.updateDecision = load;
        $scope.editComment = editComment;
        $scope.allowAddNodes = false;

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
        $scope.isDisabled = isDisabled,
        $scope.contentEdited = contentEdited,
        $scope.canEdit = canEdit();
        $scope.canView = canView();
        $scope.canDebug = canDebug();
        $scope.user   = _.pick(user, ['userID', 'name']);
        $scope.close  = close;
        $scope.translate = translate;
        $scope.save   = save;
        $scope.cancel   = cancel;
        $scope.upload = upload;
        $scope.comments    = {};
        $scope.commentResources = [];
        $scope.selectDecision = selectDecision;
        $scope.selectMeeting  = selectMeeting;
        $scope.selectMeetingDocument = selectMeetingDocument;
        $scope.actionEdit  = edit;
        $scope.isEditable  = isEditable;
        $scope.addTo       = addTo;
        $scope.removeFrom  = removeFrom;
        $scope.element = {};

        $scope.noNarrower = function(t) { return !t.narrowerTerms || !t.narrowerTerms.length; };
        $scope.collections = {
            annexes     : annexList,
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

        //==============================
        //
        //==============================
        function close() {
            $location.url(('/'+body+'/'+pad(session)+'/'+pad(decision)).toLowerCase());
        }

        //==============================
        //
        //==============================
        function translate() {
            $location.url(('/'+body+'/'+pad(session)+'/'+pad(decision)).toLowerCase()+'/edit/translation');
        }


        //===========================
        //
        //===========================
        function load() {

            var q0 = $http.get('/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms',  { cache: true } );
            var q1 = $http.get('/api/v2013/thesaurus/domains/AICHI-TARGETS/terms', { cache: true } );
            var q2 = $http.get('/api/v2015/treaties/'+ encodeURIComponent(treaty.code), { cache: true } );
            var q3 = $http.get('/api/v2013/thesaurus/domains/GBF-TARGETS/terms', { cache: true } );
            var q4 = $http.get('/api/v2013/thesaurus/domains/GBF-GOALS/terms', { cache: true } );
            var q5 = $http.get('/api/v2013/thesaurus/domains/GBF-TARGETS-CONSIDERATIONS/terms', { cache: true } );

            $q.all([q0, q1, q2, q3, q4, q5]).then(function(res) {

                $scope.collections.subjects        =   res[5].data.concat(res[0].data);
                $scope.collections.aichiTargets    =   res[1].data;
                $scope.collections.gbfTargets      =   res[3].data;
                $scope.collections.gbfGoals        =   res[4].data;
                $scope.collections.subjectsMap     = _(res[0].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});
                $scope.collections.aichiTargetsMap = _(res[1].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});
                $scope.collections.gbfTargetsMap   = _(res[3].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});
                $scope.collections.gbfGoalsMap     = _(res[4].data).reduce(function(r,v){ r[v.identifier] = v; return r; }, {});

                treaty   = res[2].data;

                const code = treaty.acronym+'/'+encodeURIComponent(body)+'/'+encodeURIComponent(pad(session))+'/'+encodeURIComponent(pad(decision));
                return $scope.api.queryDecisionTree(code);

            }).then(function(res){

                $scope.decision     = res;
                $scope.subjects     = _.cloneDeep(res.subjects|| []);
                $scope.aichiTargets = _.cloneDeep(res.aichiTargets || []);
                $scope.gbfTargets   = _.cloneDeep(res.gbfTargets || []);
                $scope.gbfGoals     = _.cloneDeep(res.gbfGoals || []);

                if(!_.isEmpty($scope.selectedNode)) {
                    updateSelectedNode(findNode($scope.decision, $scope.selectedNode._id));
                }

            }).then(function(){

                loadComments();

            }).catch(function(err){

                err = (err||{}).data || err;

                console.error(err);

                if(err.status==403)
                    $location.url('/403?returnurl='+encodeURIComponent($location.url()));

                alert(err.message||err);
            });
        }

        function updateSelectedNode(newNode) {

            if(!newNode) {
                $scope.selectedNode = null;
                $scope.element = {};
                $scope.commentResources = [];
                return;
            }
            
            const selectedNode = _.cloneDeep(newNode);
            selectedNode.nodeType = selectedNode.annex ? 'annex' : 'paragraph';
            selectedNode.documents = selectedNode.documents || [];
            
            $scope.selectedNode = selectedNode;
            $scope.element = _.cloneDeep(selectedNode);

            $scope.commentResources = _.compact([data.code, $scope.element.code]);
        }

        function editComment(node) {
            if(!$scope.selectedNode || $scope.selectedNode._id !== node._id) updateSelectedNode(node);
            $scope.$applyAsync(() => {
                document.querySelector('a[name="comment"]').scrollIntoView({
                    block: 'center',
                    behavior: "smooth"
                });
            });
        }

        //===========================
        //
        //===========================

        async function save() {
            if(!canEdit()) {
                alert("Unauthorized to save");
                throw new Error("unauthorized to save");
            }

            const {selectedNode, element, decision, subjects, aichiTargets, gbfTargets, gbfGoals} = $scope;

            const decisionId = decision._id;
            var saved = false;
            if(!areEquals(subjects, decision.subjects) || !areEquals(aichiTargets, decision.aichiTargets) || !areEquals(gbfTargets, decision.gbfTargets) || !areEquals(gbfGoals, decision.gbfGoals)) {
                const {title} = decision;
                const params = {title, subjects, aichiTargets, gbfTargets, gbfGoals};
                await $scope.api.updateDecision(decisionId, params);
                saved = true;
            }

            if(selectedNode) {
                if(element.nodeType !== 'annex') element.annex = null;
                else element.annex = element.annex || annexList[0].value;

                await $scope.api.updateDecisionNode(decisionId, element._id, element);
                load();
                updateSelectedNode(selectedNode);
                saved = true;
            }
            if(saved) alert( "Your document has been successfully saved." );
        }

        function cancel() {
            $scope.subjects     = _.cloneDeep($scope.decision.subjects);
            $scope.aichiTargets = _.cloneDeep($scope.decision.aichiTargets);
            $scope.gbfTargets   = _.cloneDeep($scope.decision.gbfTargets);
            $scope.gbfGoals     = _.cloneDeep($scope.decision.gbfGoals);
            updateSelectedNode($scope.selectedNode);
        }

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

            }).catch(console.error);
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
        function mettingUrlToCode(m) {

            var meetingUrlRE = /^https?:\/\/www.cbd.int\/meetings\/([a-zA-Z0-9\-]+)$/;

            if(meetingUrlRE.test(m))
                m = m.replace(meetingUrlRE, '$1');

            return m;
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
                    paragraph : $scope.element.code
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

                $scope.element.files = $scope.element.files||[];
                $scope.element.files.push(fileInfo);

            }).catch(function(err) {

                console.error((err||{}).message || err);

                fileInfo.error = (err||{}).data || err;

            });
        }

        function selectMeetingDocument() {

            openDialog(import('./select-document-dialog'), { showClose: false }).then(function(dialog){

                dialog.closePromise.then(function(res){

                    if(!res.value)
                        return;

                    addTo(res.value, $scope.element.documents);
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

                    addTo(res.value, $scope.element.decisions);
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

                    $scope.element.outcomes = $scope.element.outcomes || [];

                    addTo(mettingUrlToCode(res.value.symbol), $scope.element.outcomes);
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
        function isDisabled(parentId, field) { return !!(findNode($scope.decision, parentId) || {})[field];}
        function contentEdited() {
            const {element, selectedNode, subjects, aichiTargets, gbfTargets, gbfGoals, decision} = $scope;

            if(subjects && decision.subjects && !areEquals(subjects, decision.subjects)) return true;
            if(aichiTargets && decision.aichiTargets && !areEquals(aichiTargets, decision.aichiTargets)) return true;
            if(gbfTargets && decision.gbfTargets && !areEquals(gbfTargets, decision.gbfTargets)) return true;
            if(gbfGoals && decision.gbfGoals && !areEquals(gbfGoals, decision.gbfGoals)) return true;
            
            const a = _.pick(element, (e) => !!e);
            const b = _.pick(selectedNode, (e) => !!e);

            if(!areEquals(a, b)) return true;

            return false;
        }

        function findNode(collection, id) {
            if(collection && collection._id && collection._id === id) {
                return collection;
            } else if (!_.isEmpty(collection.nodes)) {
                let result = null;
                collection.nodes.forEach(node => {
                    if(result) return;
                    result = findNode(node, id);
                });
                return result;
            }
            return null;
        }
    }];

    //===========================
    //
    //===========================
    function resData(res) {
        return res.data;
    }