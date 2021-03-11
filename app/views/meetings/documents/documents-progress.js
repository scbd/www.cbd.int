define(['lodash', 'require', 'moment', 'angular', 'moment-timezone', '~/filters/lstring', '~/filters/moment', '~/filters/initials', 'directives/file','ngDialog',
        '~/directives/meetings/documents/document-files','./document-progress-steps', 'directives/comments/internal-comments', 
], function(_,require, moment) {

	return ["$scope", "$route", "$http", '$location', '$q', 'user', 'ngDialog', function ($scope, $route, $http, $location, $q, user, ngDialog) {
        
        var meetingCode = $route.current.params.meeting.toUpperCase();
        var _ctrl       = $scope.statusCtrl = this;

        var TODAY = _ctrl.TODAY = $scope.TODAY = moment().startOf('day').toDate();

        _ctrl.loadLogs = loadLogs;
        _ctrl.refresh  = load;
        _ctrl.action   = action;
        _ctrl.onFile   = upload;
        _ctrl.updateWorkflow = updateWorkflow;
        _ctrl.toIDs    = toIDs;
        _ctrl.expand   = expand;
        _ctrl.editMode = false;
        _ctrl.isAdmin  = !!_.intersection(user.roles, ['EditorialService', 'Administrator']).length;
        _ctrl.standardRoles = [
            'ScbdDirectors',
            'ES-Review',
            'EditorialService'
        ];
        
        _ctrl.filters = {
            type_nature:  'official',
            dueFilter:    dueFilter,
            statusFilter: statusFilter,
            documentTypeFilter: documentTypeFilter,
            assignedToFilter:   assignedToFilter,
            gridIncrement : 'months'
        };

        $scope.$on('load-document-progress', load);
        
        load();
        
        //==============================
        //
        //==============================
        function load() {

            var meeting = $http.get('/api/v2016/meetings/'+meetingCode, { cache:true, params: { f : { EVT_CD:1, EVT_FROM_DT:1, agenda:1, title:1, type:1 } } }).then(function(res){

                meeting = _.defaults(res.data, {
                    code: res.data.EVT_CD,
                    agenda: { items: [] },
                });

                _ctrl.meeting = meeting;

                return meeting;
                
            }).catch(function(err) {

                if(err.status!=404)
                    throw err;

                _ctrl.error = "meetingNotFound";
            });

            var documents = $http.get('/api/v2016/meetings/'+meetingCode+'/documents', { params: { q: { type : "official" } } }).then(function(res){

                documents = _(res.data).each(normalizeDocument).each(expanded).sortBy(sortKey).value();
                
                _ctrl.documents = documents;

                computeAbsoluteProgress();

            }).then(function(){

                $scope.$applyAsync(function(){
                    $("[help-date]").tooltip();
                    $("[help-step]").tooltip();
                })

            }).catch(console.error).then(function(){ _ctrl.loaded = true; });
        }

        //==============================
        //
        //==============================
        function normalizeDocument(d){
            d.type_nature = _.compact([d.type, d.nature]).join('/');
            d.workflow    = _.defaults(d.workflow||{}, {
                canEdit : !!_.intersection(user.roles, ['Administrator', 'EditorialService']).length,
                steps : []
            });
        }

        //==============================
        //
        //==============================
        function computeAbsoluteProgress() {

            var meeting      = _ctrl.meeting;
            var documents    = _ctrl.documents;
            var cutOffDate   = moment(meeting.EVT_FROM_DT).subtract(6, 'weeks');
            var ignoreBefore = moment(meeting.EVT_FROM_DT).subtract(6, 'months');
            
            var stepDates = _(documents).map('workflow').map('steps').compact().flatten().map('dueDate').compact().union([cutOffDate.toISOString()]).filter(function(date) {
                return moment(date).isAfter(ignoreBefore);
            }).sortBy().value();

            var startDate = _(documents).map('workflow').map('steps').compact().flatten().map('startDate').compact().sortBy().first();
            
            var minDate = moment.min(moment(_.first(stepDates)), moment(startDate)).startOf('week');
            var maxDate = moment(_.last (stepDates)).add(1,"weeks").startOf('week');
            var days    = maxDate.diff(minDate, 'days');

            // Compute grid |  |  |  |  |  |

            var gridDates = [
                { date  : moment()  .toDate(), start : (moment(TODAY).diff(minDate, 'days') * 100 / days) | 0, type: "today" },
                { date  : cutOffDate.toDate(), start : (cutOffDate.diff(minDate, 'days') * 100 / days) | 0, type: "cutoff" }
            ];

            var gridInc = _ctrl.filters.gridIncrement;
            var incr    = moment(minDate).startOf('week');

            while(incr.isBefore(maxDate)) {
                gridDates.push({ date  : incr.toDate(), start : (incr.diff(minDate, 'days') * 100 / days) | 0, type: "grid" });
                incr = incr.add(1, gridInc).startOf(gridInc);
            }

            _ctrl.gridDates = _.sortBy(gridDates, 'date');

            // Compute steps  ---- ---- - --- --
            
            documents.forEach(function(doc) {

                var steps = doc.workflow.steps;

                doc.workflow.activeStep = _.find(steps, { status: 'active'}) || steps[0];

                for(var i in steps) {

                    var step = steps[i]
                    var prev = steps[i-1] || { dueDate : moment.min(moment(step.dueDate).subtract(1, 'months'), moment(step.startDate || TODAY)).toDate() };

                    step.dueStartDate = prev.dueDate;

                    step.absProgress = {
                        start : (Math.max(moment(step.dueStartDate).diff(minDate, 'days'), 0) * 100 / days) | 0,
                        stop  : (Math.max(moment(step.dueDate)     .diff(minDate, 'days'), 0) * 100 / days) | 0,
                    }
                }
            });
        }

        //==============================
        //
        //==============================
        function expanded(d){
            
            var prev = _.find(_ctrl.documents||[], { _id: d._id });
            
            if(prev && prev.expanded) {
                d.expanded = true;
                
                if(prev.logs)
                    loadLogs(d);
            }
        }
        
        //==============================
        //
        //==============================
        function sortKey(d) {
            
            var typePos;

                 if(d.type=='in-session' && d.nature=="limited")     typePos = 10;
            else if(d.type=='in-session' && d.nature=="crp")         typePos = 20;
            else if(d.type=='in-session' && d.nature=="non-paper")   typePos = 30;
            else if(d.type=="official")                              typePos = 40;
            else if(d.type=="information")                           typePos = 50;
            else if(d.type=="other")                                 typePos = 60;
            else if(d.type=='in-session' && d.nature=="statement")   typePos = 70;

            return ("000000000" + (typePos||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   (d.group ||'').toUpperCase() + '_' +
                   normalizeSymbol(d.symbol).replace(/(\b|\D)(\d{1})\b/g, '$10$2')
                                            .replace(/(\b|\D)(\d{2})\b/g, '$10$2');
        }
        
        //==============================
        //
        //==============================
        function normalizeSymbol(symbol) {
            return (symbol||"").toUpperCase().replace(/[^A-Z0-9\/\-\*]/gi, '').replace(/\/$/g, '');
        }

        //==============================
        //
        //==============================
        function loadLogs(doc) {
            
            if(doc.logs)
                return;
            
            $http.get('/api/v2016/meetings/'+meetingCode+'/documents/'+doc._id).then(function(res){
                doc.logs = res.data.logs||[];
            });
        }

        //==============================
        //
        //==============================
        function updateWorkflow(doc, data) {

            $http.put('/api/v2016/documents/'+doc._id+'/workflow', data).then(function(){
                
                $scope.$emit('load-document-progress');
                
            }).catch(console.error);
            
        }

        //==============================
        //
        //==============================
        function upload(file, doc) {
            action(doc, file);
        }
        
        //==============================
        //
        //==============================
        function toIDs (list) { 
            return _(list).map(function(u) { return u.userID || u.userId || u; }).uniq().value();
        }
        
        function expand(doc, val) {

            if(val===undefined)
                val = !doc.expanded;
                
            _ctrl.documents.forEach(function(d){ d.expanded=false; });

            doc.expanded = val;
        }

        //==============================
        //
        //==============================
        function action(doc, file) {
            openDialog('./documents-progress-dialog', { resolve: { data : resolver({ documents : _ctrl.documents, document: doc, file: file }) } }).then(function(dialog){
                dialog.closePromise.then(function(res){
                    if(res.value)   
                        load();
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

        ///////////////////////////////////
        /////////// FILTERS ///////////////
        ///////////////////////////////////

        //===========================
        //
        //===========================
        function assignedToFilter(d) {
            
            if(!_ctrl.filters.assignedToMe) return true;
            
            return d.workflow && d.workflow.activeStep && d.workflow.activeStep.assignedToMe;
        }

        //===========================
        //
        //===========================
        function dueFilter(d) {
            
            if(!_ctrl.filters.overdue) return true;
            
            return d.workflow && _.find(d.workflow.steps||[], function(s) { 
                return (s.status=='active'  || s.status=='pending') && s.dueDate <= TODAY;
            });
        }
        
        //===========================
        //
        //===========================
        function documentTypeFilter(d) {
            
            if(!_ctrl.filters.type_nature) return true;
            
            return d.type        == _ctrl.filters.type_nature ||
                   d.type_nature == _ctrl.filters.type_nature;
        }
        
        //===========================
        //
        //===========================
        function statusFilter(d) {
            
            if(!_ctrl.filters.status) return true;
            
            console.log(d.type_nature);
            
            if(_ctrl.filters.status=='!public') 
                return d.status != 'public';
            
            return d.status == _ctrl.filters.status;
        }
	}];
});
