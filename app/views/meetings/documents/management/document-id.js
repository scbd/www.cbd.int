define(['lodash', 'filters/lstring', 'directives/file','../meeting-document'], function(_) {

    var MIMES = {
        'application/pdf':                                                            { title: 'PDF',               color: 'red',    btn: 'btn-danger',  icon: 'fa-file-pdf-o'   },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { title: 'Word (docx)',       color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/msword':                                                         { title: 'Word (doc)',        color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { title: 'Excel (xlsx)',      color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.ms-excel':                                                   { title: 'Excel (xls)',       color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { title: 'PowerPoint (pptx)', color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/vnd.ms-powerpoint':                                              { title: 'PowerPoint (ppt)',  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/zip':                                                            { title: 'Zip',               color: '',       btn: 'btn-default', icon: 'fa-file-archive-o' },
        'text/html':                                                                  { title: 'Web',               color: '',       btn: 'btn-default', icon: 'fa-link' },
        'default':                                                                    { title: '',                  color: 'orange', btn: 'btn-default', icon: 'fa-file-o' }
    };

    var LANGUAGES = {
         ar : "Arabic",
         en : "English",
         es : "Spanish",
         fr : "French",
         ru : "Russian",
         zh : "Chinese"
     };

	return ["$scope", "$route", "$http", '$location', '$q', function ($scope, $route, $http, $location, $q) {

        $scope.FILETYPES  = MIMES;
        $scope.LANGUAGES  = LANGUAGES;

        var documentId = $route.current.params.id;
        var meetingId  = $route.current.params.meeting;

        var _ctrl = $scope.editCtrl = this;
        var document_bak;

        _ctrl.addItem     = addItem;
        _ctrl.removeItem  = removeItem;
        _ctrl.removeFile  = removeFile;
        _ctrl.upload      = upload;
        _ctrl.fileCache   = {};

        _ctrl.clearErrors = clearErrors;
        _ctrl.save   = save;
        _ctrl.close  = close;

        load();

        //==============================
        //
        //==============================
        function load() {

            clearErrors();

            $http.get('/api/v2016/meetings/'+meetingId).then(function(res) {

                _ctrl.meeting = res.data;

                if(documentId=='new')
                    return { };

                return $http.get('/api/v2016/meetings/'+meetingId+'/documents/'+documentId).then(function(res) {
                    return res.data;
                });

            }).then(function(document) {

                if(document.metadata && document.metadata.message)
                    document.metadata.message.level = document.metadata.message.level || "";

                document.files = document.files || [];
                document_bak   = _.cloneDeep(document); //fullclone
                _ctrl.document = document;

                initFiles();

            }).catch(function(err) {
                _ctrl.error = err.data || err;
                console.error(err);
            });
        }


        //==============================
        //
        //==============================
        function save() {

            var oldDoc = prepareData(document_bak);
            var newDoc = prepareData(_ctrl.document);

            var fileIds       = _(_ctrl.document.files).map('_id').compact().uniq().value();

            var filesToCreate = _(_ctrl.document.files||[]).filter(function(f) { return !f._id;                   }).value();
            var filesToDelete = _(document_bak  .files||[]).filter(function(f) { return !~fileIds.indexOf(f._id); }).value();

            var req = $q.resolve(newDoc._id);

            var hasChange = !newDoc._id || JSON.stringify(newDoc) != JSON.stringify(oldDoc);

            if(hasChange) { // update only if any chnages;

                req = $http({
                    data   : newDoc,
                    method : newDoc._id ? 'PUT' : 'POST',
                    url    : newDoc._id ? '/api/v2016/meetings/'+meetingId+'/documents/'+newDoc._id :
                                          '/api/v2016/meetings/'+meetingId+'/documents'
                }).then(function(res) {

                    return (_ctrl.document._id = _ctrl.document._id || res.data._id);

                });
            }

            req.then(function(docId){

                var delQ = _.map(filesToDelete, function(f){
                    return $http.delete('/api/v2016/documents/'+docId+'/files/'+f._id);
                });

                var newQ = _.map(filesToCreate, function(f){
                    return $http.post('/api/v2016/documents/'+docId+'/files', { url : f.url });
                });

                return $q.all(delQ.concat(newQ));

            }).then(function(){

                close();

            }).catch(function(err) {
                _ctrl.error = err.data || err;
                console.error(err);
            });
        }

        //==============================
        //
        //==============================
        function prepareData(document) {

            var doc = {
                _id:         document._id,
                symbol:      document.symbol || undefined,
                type:        document.type,
                group:       document.group  || undefined,
                date:        document.date   || new Date(),
                agendaItems: document.agendaItems,
                title:       document.title,
                description: document.description,
                metadata:    _.clone(document.metadata||{}, true),
            };

            if(doc.metadata && doc.metadata.message)
                doc.metadata.message.level = doc.metadata.message.level || null;

            return doc;
        }

        //==============================
        //
        //==============================
        function upload(file, force) {

            clearErrors();

            if(!file) return;

            var type     = file.type;
            var language = parseFilename(file.name).language;

            // SANITIZE

            if(!/^[a-z0-9][a-z0-9_\-\.]{7,127}$/i.test(file.name)) {
                _ctrl.fileError = {
                    code: "FILENAME",
                    new: {  name: file.name, type: file.type, language: language }
                };
                return;
            }

            if(!language) {
                _ctrl.fileError = {
                    code: "LANGUAGE",
                    new: {  name: file.name, type: file.type, language: language }
                };
                return;
            }

            var oldFile =  _ctrl.fileCache[type] && _ctrl.fileCache[type][language];

            if(oldFile && force) {

                _ctrl.document.files = _.without(_ctrl.document.files, oldFile);

                oldFile = null;

                initFiles();
            }

            if(oldFile) {
                _ctrl.fileError = {
                    code: "EXISTS",
                    old: _ctrl.fileCache[type][language],
                    new: { name: file.name, type: file.type, language: language }
                };
                return;
            }

            // DO UPLOAD

            var target;

            $scope.uploading = true;
            $scope.uploadProgress = 0;

            return $http.post('/api/v2015/temporary-files', { filename : file.name }).then(function(res) {

                target = res.data;

                return $http.put(target.url, file, {
                    headers : { 'Content-Type' : target.contentType },
                    uploadEventHandlers: { progress: uploadProgress }
                });

            }).then(function() {

                return $http.get('/api/v2015/temporary-files/'+target.uid);

            }).then(function(res) {

                var fileInfo = {
                    name: res.data.filename,
                    type: res.data.contentType,
                    size: res.data.contentLength,
                    url: 'upload://'+target.uid,
                    language: language
                };

                _ctrl.document.files.push(fileInfo);

                initFiles();

            }).catch(function(err) {
                _ctrl.error = err.data || err;
                console.error(err);
            }).finally(function(){
                delete $scope.uploading;
                delete $scope.uploadProgress;
            });

        }

        //==============================
        //
        //==============================
        function uploadProgress(e) {
            $scope.$applyAsync(function() {
                $scope.uploadProgress = (e.loaded*100/e.total)|0;
            });
        }

        //==============================
        //
        //==============================
        function parseFilename(filename) {

            filename = filename.toLowerCase();

            var matches = filename.match(/-([a-z]{2})\.[a-z]+$/i);

            return {
                name     : filename,
                prefix   : filename.replace(/-[a-z]{2}\.[a-z]+$/i, ''),
                language : matches && matches[1].toLowerCase()
            };
        }

        //==============================
        //
        //==============================
        function initFiles() {

            var files = _ctrl.document.files;

            _ctrl.fileCache = {
                languages : _(files).map('language').uniq().sort().value(),
                types     : _(files).map('type'    ).uniq().sort().value(),
                names     : _(files).map('name'    ).uniq().sort().value(),
                prefixes  : _(files).map(function(f){ return parseFilename(f.name).prefix; }).uniq().sort().value()
            };

            _.forEach(files, function(f){
                _ctrl.fileCache[f.type] = _ctrl.fileCache[f.type] || {};
                _ctrl.fileCache[f.type][f.language] = f;
            });
        }

        //==============================
        //
        //==============================
        function addItem(item) {
            item = Number(item);
            _ctrl.document.agendaItems = _(_ctrl.document.agendaItems||[]).union([item]).uniq().sort(_.identity).value();
        }

        //==============================
        //
        //==============================
        function removeItem(item) {
            _ctrl.document.agendaItems = _(_ctrl.document.agendaItems||[]).filter(function(i){ return i!=item; }).uniq().sort(_.identity).value();
            if(!_ctrl.document.agendaItems.length)
                delete _ctrl.document.agendaItems;
        }

        //==============================
        //
        //==============================
        function removeFile(file) {

            _ctrl.document.files = _(_ctrl.document.files||[]).without(file).value();
            initFiles();
        }

        //==============================
        //
        //==============================
        function close() {

            if(_ctrl.document._id) {
                $location.search({ tabFor: _ctrl.document._id});
            }

            if(meetingId=="COP13-HLS") return $location.path('/2016/cop-13-hls/documents');
            if(meetingId=="COP-13")    return $location.path('/2016/cop-13/documents');
            if(meetingId=="MOP-08")    return $location.path('/2016/cp-mop-8/documents');
            if(meetingId=="NP-MOP-02") return $location.path('/2016/np-mop-2/documents');

            $location.path('/');
        }

        //==============================
        //
        //==============================
        function clearErrors() {
            delete _ctrl.error;
            delete _ctrl.fileError;
        }
	}];
});
