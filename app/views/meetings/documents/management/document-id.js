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
        var supersede_bak;

        var forceUpdate;

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

                document_bak = _.cloneDeep(document); //fullclone

                _ctrl.document       = document;
                _ctrl.document.files = document.files || [];

                forceUpdate = document.files.length && !((document.metadata||{}).patterns||[]).length;

                initFiles();

                return loadSupersede();

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

            var hasChange = forceUpdate || !newDoc._id || JSON.stringify(newDoc) != JSON.stringify(oldDoc);

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

            req.then(function(docId) {

                var delQ = _.map(filesToDelete, function(f){
                    return $http.delete('/api/v2016/documents/'+docId+'/files/'+f._id);
                });

                var newQ = _.map(filesToCreate, function(f){
                    return $http.post('/api/v2016/documents/'+docId+'/files', { url : f.url });
                });

                return $q.all(delQ.concat(newQ));

            }).then(function(){

                return saveSupersede();

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
        function loadSupersede() {

            return $http.get('/api/v2016/meetings/'+meetingId+'/documents').then(function(res) {

                _ctrl.meetingDocuments  = _(res.data).forEach(function(d){
                    d.display = (d.symbol || d.title.en) + ((d.metadata && d.metadata.superseded && ' - (Superseded by '+d.metadata.superseded+')')||'') ;
                    d.sortKey = sortKey(d);
                }).sortBy(sortKey).value();

                _ctrl.meetingDocuments.unshift({ _id : undefined, display : ""});

                if(_ctrl.document._id) {
                    _ctrl.supersede = _(_ctrl.meetingDocuments).filter(function(d) { return d.metadata && d.metadata.superseded===_ctrl.document.symbol; }).map('_id').first();
                    supersede_bak   = _ctrl.supersede;
                }

            }).catch(function(err) {
                _ctrl.error = err.data || err;
                console.error(err);
            });
        }

        //==============================
        //
        //==============================
        function saveSupersede() {

            if(!_ctrl.document._id)             return;
            if( _ctrl.supersede==supersede_bak) return;

            var old = null;

            if(supersede_bak) {

                old = $q.when(null).then(function(){

                    return $http.get('/api/v2016/meetings/'+meetingId+'/documents/'+supersede_bak).then(resData);

                }).then(function(doc) {

                    if(!doc.metadata || !doc.metadata.superseded)
                        return;

                    delete doc.metadata.superseded;

                    return $http.put('/api/v2016/meetings/'+meetingId+'/documents/'+doc._id, doc);

                }).then(function(){

                    supersede_bak = undefined;

                }).catch(function(err) {
                    _ctrl.error = err.data || err;
                    console.error(err);
                    throw err;
                });
            }

            if(_ctrl.supersede) {

                $q.when(old).then(function(){

                    return $http.get('/api/v2016/meetings/'+meetingId+'/documents/'+_ctrl.supersede).then(resData);

                }).then(function(doc) {

                    doc.metadata = doc.metadata || {};
                    doc.metadata.superseded = _ctrl.document.symbol || _ctrl.document.title.en;

                    return $http.put('/api/v2016/meetings/'+meetingId+'/documents/'+doc._id, doc);

                }).then(function(){

                    supersede_bak = _ctrl.supersede;

                }).catch(function(err) {
                    _ctrl.error = err.data || err;
                    console.error(err);
                    throw err;
                });

                _ctrl.supersede
            }


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
                metadata:    _.cloneDeep(document.metadata||{}),
            };

            doc.metadata.patterns = _(document.files).map('name').map(parseFilename).map('prefix').uniq().sort().value();

            if(doc.metadata.message)
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
                prefixes  : _(files).map('name'    ).map(parseFilename).map('prefix').uniq().sort().value()
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

        //==============================
        //
        //==============================
        function sortKey(d) {

            var typePos;

                 if(d.type=="report")      typePos = 10;
            else if(d.type=="outcome")     typePos = 20;
            else if(d.type=="limited")     typePos = 30;
            else if(d.type=="crp")         typePos = 40;
            else if(d.type=="non-paper")   typePos = 50;
            else if(d.type=="official")    typePos = 60;
            else if(d.type=="information") typePos = 70;
            else if(d.type=="other")       typePos = 80;
            else if(d.type=="statement")   typePos = 90;

            return ("000000000" + (typePos   ||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   (d.group||'') + '_' +
                 //  ((d.metadata||{}).superseded ? '1' : '0') + '_' +
                   ("000000000" + (d.position||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   (d.symbol||"").replace(/\b(\d)\b/g, '0$1')
                                 .replace(/(\/REV)/gi, '0$1')
                                 .replace(/(\/ADD)/gi, '1$1');
        }

        //====================================
        //
        //====================================
        function resData(res) { return res.data; }
	}];
});
