/* global -close */
define(['lodash'], function(_) {

	return ["$scope", "$http", "data", function ($scope, $http, data) {
        
        $scope._self = $scope;
        $scope.data = data;
        $scope.selectedDocument = data.document;
        $scope.fileInfo = null;

        $scope.close = function(v) { $scope.closeThisDialog(v); };
        $scope.action = action;
        $scope.upload = upload;

        if(data.file) {
            upload(data.file);
        }
        
        //====================
        //
        //====================
        $scope.$watch('selectedDocument', function(d) {
            
            if(!d)                return;
            if(!d.workflow)       return;
            if(!d.workflow.steps) return;
            
            var activeStep = _.find(d.workflow.steps, { status:'active' });
            
            if(!activeStep) return;
            
            if(activeStep.inRevision)
                $scope.latestfileInfo = _.find(d.workflow.files||[], { revision : activeStep.inRevision });
        });

        $scope.$watch('selectedDocument', function(d) {
            
            if(!d)                return;
            if(!d.workflow)       return;
            if(!d.workflow.steps) return;
            
            var activeStep = _.find(d.workflow.steps, { status:'active' });
            
            if(!activeStep) return;
            
            $scope.nextAction = d.workflow.steps[d.workflow.steps.indexOf(activeStep)+1];
        });

        //====================
        //
        //====================
        function action(step) {
            
            var doc = $scope.selectedDocument;
            var postData = { };
            
            if($scope.fileInfo && $scope.fileInfo.upload)
                postData.url = $scope.fileInfo.url;
            
            $http.post('/api/v2016/documents/'+doc._id+'/workflow/steps/'+step._id+'/activate', postData).then(function(){
                $scope.close(doc._id);
            });
            
        }

        //====================
        //
        //====================
        function upload(file) {
            
            var target;
            
            $scope.uploadStatus = 'uploading';

            return $http.post('/api/v2015/temporary-files', { filename : file.name }).then(function(res) {

                target = res.data;

                return $http.put(target.url, file, {
                    headers : { 'Content-Type' : target.contentType },
//                    uploadEventHandlers: { progress: uploadProgress }
                });

            }).then(function() {

                return $http.get('/api/v2015/temporary-files/'+target.uid);

            }).then(function(res) {
                

                $scope.fileInfo = {
                    upload: true,
                    name: res.data.filename,
                    type: res.data.contentType,
                    size: res.data.size,
                    md5 : res.data.hash,
                    url: 'upload://'+res.data.uid,
//                    language: language
                };
                
                $scope.uploadStatus = 'detecting';

                return $http.get('https://attachments.cbd.int/metadata/'+res.data.uid+'/temp').then(function(res){
                    
                    $scope.fileInfo.word = res.data;
                    
                }).catch(function(err) { console.error(err); });

            }).then(function() {
                
                var fileInfo = $scope.fileInfo;

                var pattern = fileInfo && fileInfo.name;
                var symbol  = normalizeSymbol(fileInfo && fileInfo.word && fileInfo.word.subject);
                
                var bestDoc = null;
                
                if(!bestDoc && symbol) {
                    bestDoc = _.find(data.documents, function(d) { return normalizeSymbol(d.symbol) == symbol; });
                }
                
                if(!bestDoc && pattern) {
                    
                    var docs = _(data.documents).filter(     function(d) { return d && d.metadata && d.metadata.patterns && d.metadata.patterns.length; })
                                                .sortByOrder(function(d) { return d.metadata.patterns.length; }, 'desc').value();
                    do {
                        bestDoc = _.find(docs, function(d) { return d.metadata.patterns[0] == pattern; });
                        pattern = pattern.substr(0, pattern.length-1);
                    } while (!bestDoc && pattern);
                }
                
                if($scope.bestDocument==$scope.selectedDocument) {
                    delete $scope.bestDocument;
                    delete $scope.selectedDocument;
                }
                
                $scope.bestDocument = bestDoc;
                
                if(!$scope.selectedDocument)
                    $scope.selectedDocument = bestDoc;
                    
                delete $scope.uploadStatus;

            }).catch(function(err) {
                $scope.uploadStatus = 'error';
                $scope.error = err.data || err;
                console.error(err);
            })
        }
        
        //==============================
        //
        //==============================
        function normalizeSymbol(symbol) {
            return (symbol||"").toUpperCase().replace(/[^A-Z0-9\/\-\*]/gi, '').replace(/\/$/g, '');
        }
	}];
});
