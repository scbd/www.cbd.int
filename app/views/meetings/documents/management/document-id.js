define(['lodash', 'filters/lstring', 'filters/moment', 'directives/file', 'filters/initials', './change-case-button', '../meeting-document'], function(_) {

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

	return ["$scope", "$route", "$http", '$location', '$q', '$window', 'user', function ($scope, $route, $http, $location, $q, $window, user) {

        $scope.FILETYPES  = MIMES;
        $scope.LANGUAGES  = LANGUAGES;

        var documentId = $route.current.params.id;
        var meetingId  = $route.current.params.meeting.toUpperCase();

        console.log($location.path());


        var _ctrl = $scope.editCtrl = this;
        var document_bak;
        var supersede_bak;

        var forceUpdate;

        $scope.getFilePatterns = function() { return getFilePatterns(_ctrl && _ctrl.document) };

        _ctrl.addItem     = addItem;
        _ctrl.removeItem  = removeItem;
        _ctrl.removeFile  = removeFile;
        _ctrl.upload      = upload;
        _ctrl.fileCache   = {};
        _ctrl.normalizeSymbol=normalizeSymbol;
        _ctrl.user        = user;

        _ctrl.clearErrors = clearErrors;
        _ctrl.del    = del;
        _ctrl.save   = save;
        _ctrl.close  = close;
        _ctrl.saveLogEntry = saveLogEntry;
        _ctrl.autoGenerateNextSymbol = autoGenerateNextSymbol;
        _ctrl.onSupersede = onSupersede;

        $scope.$watch('editCtrl.document.type_nature', applyTypeNature);
        $scope.$watch('editCtrl.document.symbol',      function(symbol){

            if(!symbol) return;
            if(!_ctrl.meetingDocuments) return;

            symbol = normalizeSymbol(symbol);

            $scope.duplicate = _.some(_ctrl.meetingDocuments, function(d){
                return d._id!=_ctrl.document._id && normalizeSymbol(d.symbol||'') == symbol;
            });
        });

        load();

        //==============================
        //
        //==============================
        function autoGenerateNextSymbol(source) {

            if(!_ctrl.document)         return;
            if( _ctrl.document._id)      return;
            if(!_ctrl.meetingDocuments) return;

            var symbol    = _ctrl.document.symbol;
            var documents = _ctrl.meetingDocuments;

            if(source == 'type' && (!symbol || /\/$/.test(symbol))) {

                var type_nature = _ctrl.document.type_nature;
                var group       = _ctrl.document.group;
                var parts;

                if(type_nature=='official')             parts = [_ctrl.meeting.EVT_UN_CD, '*'];
                if(type_nature=='information')          parts = [_ctrl.meeting.EVT_UN_CD, 'INF', '*'];
                if(type_nature=='in-session/crp')       parts = [_ctrl.meeting.EVT_UN_CD, group, 'CRP*'];
                if(type_nature=='in-session/limited')   parts = [_ctrl.meeting.EVT_UN_CD, group, 'L*'];
                if(type_nature=='in-session/non-paper') parts = [];
                if(type_nature=='in-session/statement') parts = [];
                if(type_nature=='other')                parts = [];

                if(parts) {
                    symbol = _.compact(parts).join('/');
                    source = 'symbol';
                }
            }

            var starRE = /\d*\*/;

            if(source == 'symbol' && starRE.test(symbol)) {

                var nextSymbol;

                for(var i=200;i>0;--i) {

                    var testSymbol = normalizeSymbol(symbol).replace(starRE, i.toString());

                    if(_.some(documents, function(d){ return (d.symbol||'').indexOf(testSymbol)===0; }))
                        break;

                    nextSymbol = testSymbol + '/';
                }

                if(nextSymbol)
                    symbol = nextSymbol;
            }

            _ctrl.document.symbol = symbol;
        }

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

                document.type_nature = _.compact([document.type, document.nature]).join('/');

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

                    _ctrl.document._id  = _ctrl.document._id  || res.data._id;
                    _ctrl.document.logs = res.data.logs || _ctrl.document.logs;

                    return _ctrl.document._id;

                }).then(function(docId){

                    var newDocPath = /\/new$/;

                    if(newDocPath.test($location.path())) {
                        $location.replace();
                        $location.path($location.path().replace(newDocPath, '/'+docId));
                    }

                    return docId;
                });
            }

            req.then(function(docId) {

                var delQ = _.map(filesToDelete, function(f){
                    return $http.delete('/api/v2016/documents/'+docId+'/files/'+f._id);
                });

                var newQ = _.map(filesToCreate, function(f){
                    return $http.post('/api/v2016/documents/'+docId+'/files', { url : f.url, generatePdf: true });
                });

                return $q.all(delQ.concat(newQ));

            }).then(function(){

                return $q.all([saveSupersede(), saveLogEntry()]);

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
        function del() {

            if(!_ctrl.document._id)
                return;

            if(!confirm("Delete this document?\n"+(document_bak.symbol||document_bak.title.en)))
                return;

            return $http.delete('/api/v2016/meetings/'+meetingId+'/documents/'+_ctrl.document._id).then(function() {

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

                    var parts = [d.symbol];

                    if(d.agendaItems && d.agendaItems.length)
                        parts.push('['+d.agendaItems.join(', ')+']');

                    if(d.metadata && d.metadata.superseded)
                        parts.push('(Superseded by '+d.metadata.superseded+')');

                    parts.push((d.title||{}).en);

                    d.display = parts.join(' ');
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
        var prev = {};
        function onSupersede() {
            console.log(_ctrl.supersede);

            if(_ctrl.document._id) return;
            if(!_ctrl.supersede)   return;

            var supersede = _.find(_ctrl.meetingDocuments, { _id: _ctrl.supersede });

            console.log(supersede);

            if(isEmptyOrSame(_ctrl.document.title      , prev.title      )) _ctrl.document.title       = _.cloneDeep(supersede.title);
            if(isEmptyOrSame(_ctrl.document.description, prev.description)) _ctrl.document.description = _.cloneDeep(supersede.description);
            if(isEmptyOrSame(_ctrl.document.agendaItems, prev.agendaItems)) _ctrl.document.agendaItems = _.cloneDeep(supersede.agendaItems);

            prev.title       = _.cloneDeep(supersede.title);
            prev.description = _.cloneDeep(supersede.description);
            prev.agendaItems = _.cloneDeep(supersede.agendaItems);
        }
        //==============================
        //
        //==============================
        function isEmptyOrSame(val, prev) {

            val  = JSON.parse(JSON.stringify(val ||{}));
            prev = JSON.parse(JSON.stringify(prev||{}));

            if(_.isEmpty(val))
                return true;

            for(let k in val)  if(val[k]!=prev[k]) return false;
            for(let k in prev) if(val[k]!=prev[k]) return false;

            return true;
        }

        //==============================
        //
        //==============================
        function saveLogEntry() {

            if(!_ctrl.document._id) return;
            if(!_ctrl.log)          return;

            var data = { text: _ctrl.log };

            return $http.post('/api/v2016/documents/'+_ctrl.document._id+'/logs', data).then(resData).then(function(log) {

                _ctrl.log = null;
                _ctrl.document.logs.push(log);

            }).catch(function(err) {
                _ctrl.error = err.data || err;
                console.error(err);
                throw err;
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
                nature:      document.nature,
                group:       document.group  || undefined,
                date:        document.date   || new Date(),
                agendaItems: document.agendaItems,
                title:       document.title,
                description: document.description,
                status:      document.status,
                displayGroup: getDisplayGroup(document),
                metadata:    _.cloneDeep(document.metadata||{}),
            };

            doc.metadata.patterns = getFilePatterns(document);

            if(doc.metadata.message)
                doc.metadata.message.level = doc.metadata.message.level || null;

            return doc;
        }

        //==============================
        //
        //==============================
        function getFilePatterns(doc) {

            if(!doc)
                return [];

            var patterns = _(doc.files).map('name').map(parseFilename).map('prefix').uniq().sort().value();

            if(patterns.length)
                return patterns;

            if(!doc.symbol)
                return [];

            var symbol = normalizeSymbol(doc.symbol);

            if(symbol.indexOf(_ctrl.meeting.EVT_UN_CD)!=0)
                return [];

            var parts = _.compact((_ctrl.meeting.normalizedSymbol+'/'+symbol.substr(_ctrl.meeting.EVT_UN_CD.length)).toLowerCase().split('/'));

            var jointed = /^(WG|CRP|L)(\d+)$/i;

            parts = _.map(parts, function(part) {

                if(jointed.test(part)) {
                    return [
                        part.replace(jointed, '$1'),
                        tryPad0(part.replace(jointed, '$2'))
                    ];
                }

                return tryPad0(part);
            });

            return [_.flatten(parts).join('-')];
        }

        //==============================
        //
        //==============================
        function tryPad0(input) {

            var output = parseInt((input || '').toString());

            if(isNaN(output))
                return input

            output = output.toString();

            while(output.length<2)
                output = '0' + output;

            return output;
        }

        //==============================
        //
        //==============================
        function getDisplayGroup(doc) {

            if(doc.type=='official')       return 'official';
            if(doc.type=='information')    return 'information';
            if(doc.type=='other')          return 'other';
            if(doc.type=='in-session') {

                if( doc.nature=='statement') return 'statement';
                if(!doc.group)               return 'in-session';
                if( doc.group =='WG.1')      return 'in-session/wg1';
                if( doc.group =='WG.2')      return 'in-session/wg2';
            }

            return 'other';
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
                    size: res.data.size,
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

            var base = encodeURIComponent($route.current.params.code || '');

            return $location.path([base, encodeURIComponent(meetingId), 'documents'].join('/'));
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
        function normalizeSymbol(symbol) {
            return symbol.toUpperCase().replace(/[^A-Z0-9\/\-\*]/gi, '').replace(/\/$/g, '');
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

            return ("000000000" + (typePos   ||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   (d.group||'') + '_' +
                 //  ((d.metadata||{}).superseded ? '1' : '0') + '_' +
                   ("000000000" + (d.displayPosition||9999)).slice(-9) + '_' + // pad with 0 eg: 150  =>  000000150
                   (d.symbol||"").replace(/\b(\d)\b/g, '0$1')
                                 .replace(/(\/REV)/gi, '0$1')
                                 .replace(/(\/ADD)/gi, '1$1');
        }

        //====================================
        //
        //====================================
        function applyTypeNature(type_nature) {

            if(!_ctrl.document)
                return;

            _ctrl.document.type   = (type_nature||'').split('/')[0] || undefined;
            _ctrl.document.nature = (type_nature||'').split('/')[1] || undefined;
        }

        //====================================
        //
        //====================================
        function resData(res) { return res.data; }
	}];
});
