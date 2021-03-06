import app from '~/app';
import require from 'require';
import _ from 'lodash';
import template from './document-progress-steps.html';
import '~/filters/moment';
import '~/filters/initials';
import 'ngDialog';
import 'directives/select-user'; 

    app.directive('documentProgressSteps', ['ngDialog', '$q',"$http", function(ngDialog, $q, $http) {
        return {
            restrict: 'E',
            replace: true,
            template: template,
            scope: {
                editMode: '<editMode',
                document: '<document',
                documents: '<documents'
            },
	        link: function($scope) {
                
                var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
                
                $scope._self    = $scope;
                $scope.action   = action;
                $scope.update   = updateStep;
                $scope.canEdit  = function(s)    { return s && s.canEdit; };
                $scope.toIDs    = function(list) { return _(list).map(function(u) { return u.userID || u.userId || u; }).uniq().value(); };
                $scope.createStep    = createStep;
                $scope.deleteStep    = deleteStep;
                $scope.startWorkflow = startWorkflow;
                $scope.initializeWorkflow = initializeWorkflow;
                $scope.workflowTemplates  = [];
                $scope.standardRoles = [
                    'ScbdDirectors',
                    'ES-Review',
                    'EditorialService'
                ];
                
                if(!$scope.document.workflow || !$scope.document.workflow.steps || !$scope.document.workflow.steps.length)
                    loadTemplates();
                
                function refresh() {
                    $scope.$emit('load-document-progress');
                }
                
                //==============================
                //
                //==============================
                function updateStep(step, data) {
                    
                    $http.put('/api/v2016/documents/'+$scope.document._id+'/workflow/steps/'+step._id, data).then(function(){
                        refresh();
                    }).catch(console.error);
                }

                //==============================
                //
                //==============================
                function action(doc) {
                    openDialog('./documents-progress-dialog', { resolve: { data : resolver({ documents : $scope.documents||[doc], document: doc }) } }).then(function(dialog){
                        dialog.closePromise.then(function(res){
                            if(res.value) {
                                $scope.$emit('load-document-progress');
                            }
                        });
                    });
                }
                
                //===========================
                //
                //===========================
                function openDialog(dialog, options) {

                    options = options || {};

                    return $q(function(resolve, reject) {

                        require([''+dialog+'.html', dialog], function(template, controller) {

                            options.plain = true;
                            options.template = template;
                            options.controller = controller;

                            if(options.showClose      ===undefined) options.showClose       = false;
                            if(options.closeByDocument===undefined) options.closeByDocument = false;
                            if(options.className      ===undefined) options.className       = 'ngdialog-theme-default none';

                            var dialog = ngDialog.open(options);

                            dialog.closePromise.then(function(res){

                                if(res.value=="$escape")      throw res; //cancel
                                if(res.value=="$document")    throw res; //cancel
                                if(res.value=="$closeButton") throw res; //cancel

                                return res;
                            });

                            resolve(dialog);

                        }, reject);
                    });
                }

                //===========================
                //
                //===========================
                function resolver(value) {
                    return function() { return value; };
                }  

                //===========================
                //
                //===========================
                function startWorkflow() {
                    
                    var doc  = $scope.document;
                    var step = $scope.document.workflow.steps[0];
                    
                    if(step.status!='pending' && step!=$scope.document.workflow.activeStep)
                        return;
                    
                    $http.post('/api/v2016/documents/'+doc._id+'/workflow/steps/'+step._id+'/activate', {}).then(function(){
                        refresh();
                    });
                }  

                //===========================
                //
                //===========================
                function createStep(s) {
                    
                    var doc = $scope.document;
                    
                    var data = {
                        type:       (s.type||'').replace(/[^A-Z0-9]/ig, ''),
                        dueDate:    adjustDate(TODAY, s.dueDate),
                        assignedTo: s.assignedTo
                    };
                    
                    if(!data.type)
                        return;
                            
                    return $http.post('/api/v2016/documents/'+doc._id+'/workflow/steps', data).then(function() {
                        
                        refresh();
                        
                    }).catch(console.error);
                }

                //===========================
                //
                //===========================
                function deleteStep(stepId) {
                    
                    var doc  = $scope.document;
                    var step = _.find($scope.document.workflow.steps||[], { _id: stepId });
                    
                    if(!step)
                        return;
                    
                    $http.delete('/api/v2016/documents/'+doc._id+'/workflow/steps/'+step._id).then(function(){
                        refresh();
                    });
                }

                //===========================
                //
                //===========================
                function loadTemplates() {
                    
                    $scope.workflowTemplates = [];

                    $http.get('/api/v2016/documents/workflow-templates').then(function(res){
                        $scope.workflowTemplates = res.data;
                    });
                }
                
                //===========================
                //
                //===========================
                function initializeWorkflow(template) {

                    var meetingDate;
                    var meeting;
                    var doc = $scope.document;
                    var steps = template.steps;
                    
                    $q.when(null).then(function() {
                        
                        if(doc.status!='awaited') throw "Document status must be 'awaited'";
                        if(!steps) throw "Template not found";
    
                        return $http.get("/api/v2016/meetings", { cache: true, params: { q: { _id: {$oid:doc.meeting } }, fo:1, f: { EVT_FROM_DT:1 } } }).then(resData);
                        
                    }).then(function(mtg){
                        console.log(mtg);
                        meeting = mtg;
                        meetingDate = new Date(mtg.EVT_FROM_DT);
                        
                        var qSteps = _.map(steps, function(s){
                            
                            var data = {
                                type:    s.type,
                                dueDate: adjustDate(meetingDate, s.dueDate),
                                assignedTo: s.assignedTo
                            };
                            
                            return $http.post('/api/v2016/documents/'+doc._id+'/workflow/steps', data).then(resData);
                        });
                        
                        return $q.all(qSteps);
                        
                    }).then(function() {
                        
                        refresh();
                        
                    }).catch(console.error);
                }

                //===========================
                //
                //===========================
                function adjustDate(seedDate, offset) {
                    
                    var date = new Date(seedDate);
                    
                    date.setDate(date.getDate()+offset);
                    
                    return date;
                }  
                
                //===========================
                //
                //===========================
                function resData(res) {
                    return res.data;
                }  
            }
        };
    }]);

