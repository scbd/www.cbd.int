import '~/filters/lstring';
import '~/directives/file';
import _ from 'lodash';

export { default as template } from './translations.html';

    var MIMES = {
        'application/pdf':                                                            { title: 'PDF',               color: 'red',    btn: 'btn-danger',  icon: 'fa-file-pdf-o'   },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { title: 'Word (docx)',       color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/msword':                                                         { title: 'Word (doc)',        color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { title: 'Excel (xlsx)',      color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.ms-excel':                                                   { title: 'Excel (xls)',       color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { title: 'PowerPoint (pptx)', color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/vnd.ms-powerpoint':                                              { title: 'PowerPoint (ppt)',  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/zip':                                                            { title: 'Zip',               color: '',       btn: 'btn-default', icon: 'fa-file-archive-o' },
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

	export default ["$scope", "$http", '$q', function ($scope, $http, $q) {

        $scope.FILETYPES  = MIMES;
        $scope.LANGUAGES  = LANGUAGES;

        initDropdown();

        $scope.$watch("filesToUpload", processFiles);
        $scope.files = [];
        $scope.remove = function(f){ $scope.files = _.without($scope.files, f); };

        //====================================
        //
        //====================================
        function processFiles(files) {

            if(!files || !files.length)
                return;

            _.forEach(files, function(f){

                var file = prepareHtmlFile(f);

                file.status="pending";

                     if(!MIMES[file.type]) file.error="TYPE";
                else if(!file.language   ) file.error="LANGUAGE";

                $scope.files.unshift(file);

                if(file.error)
                    return;

                $q.when(file).then(function(){

                    file.status="uploading";
                    return upload(file);

                }).then(function() {

                    file.status="lookupDocuments";

                    return lookupDocuments(file);

                }).then(function(documents) {

                         if(!documents.length)    file.error="NO_DOCUMENT";
                    else if( documents.length!=1) file.error="TOO_MANY_DOCUMENTS";

                    if(file.error)
                        throw file.error;

                    file.document = documents[0];

                }).then(function() {

                    file.exist = _(file.document.files).findWhere({ language: file.language, type : file.type });

                    if(file.exist) {
                        return removeFile(file.document._id, file.exist._id);
                    }

                }).then(function() {

                    return addFile(file.document._id, file.url);

                }).then(function(fileInfo) {

                    file._id = fileInfo._id;
                    file.status = "completed";

                }).catch(function(err) {

                    if(file.status=='canceled')
                        return;

                    console.error(err);

                    file.errorEx = err;
                    file.status = "error";

                    if(!file.error)
                        file.error = "UNKNOWN";

                    throw err;
                });
            });
        }

        //==============================
        //
        //==============================
        function ask(file, message) {

            return $q(function(resolve, reject){
                file.ask = {
                    message : message,
                    yes : function() { file.ask = null; resolve(true);  },
                    no  : function() { file.ask = null; resolve(false); },
                };
            });
        }


        //==============================
        //
        //==============================
        function upload(file) {

            file.upload.progress = 0;

            var target;

            return $http.post('/api/v2015/temporary-files', { filename : file.upload.htmlFile.name }).then(function(res) {

                target = res.data;

                return $http.put(target.url, file.upload.htmlFile, {
                    headers : { 'Content-Type' : target.contentType },
                    uploadEventHandlers: { progress: function(e) {
                        $scope.$applyAsync(function() {
                            file.upload.progress = (e.loaded*100/e.total)|0;
                        });
                    }}
                });

            }).then(function() {

                return $http.get('/api/v2015/temporary-files/'+target.uid).then(resData);

            }).then(function(fileInfo) {

                file.upload.completed = true;

                file.hash = fileInfo.hash;
                file.url  = 'upload://'+target.uid;

                return file;

            }).catch(function(err) {
                file.error        = "UPLOAD";
                throw err;
            });
        }

        //==============================
        //
        //==============================
        function addFile(docId, url) {

            return $http.post('/api/v2016/documents/'+docId+'/files', { url : url, generatePdf: true }).then(resData).catch(function(err) {
                file.error = "ADD_FILE";
                throw err;
            });
        }

        //==============================
        //
        //==============================
        function removeFile(docId, fileId) {

            return $http.delete('/api/v2016/documents/'+docId+'/files/'+fileId).then(resData).catch(function(err) {
                file.error = "REMOVE_FILE";
                throw err;
            });
        }

        //==============================
        //
        //==============================
        function lookupDocuments(file) {

            var query = { 'metadata.patterns' : file.prefix, linkedToId : { $exists : false } };

            return $http.get('/api/v2016/documents', { params : { q : query } }).then(resData).catch(function(err) {
                file.error = "LOOKUP_DOCUMENTS";
                throw err;
            });
        }

        //==============================
        //
        //==============================
        function prepareHtmlFile(file) {

            var filename = file.name.toLowerCase();
            var matches  = filename.match(/-([a-z]{2})\.[a-z]+$/i);

            return {
                name     : filename,
                prefix   : filename.replace(/-[a-z]{2}\.[a-z]+$/i, ''),
                language : matches && matches[1].toLowerCase(),
                type     : file.type,
                size     : file.size,
                upload   : {
                    htmlFile : file
                }
            };
        }

        //====================================
        //
        //====================================
        function initDropdown() {

            var div = document.createElement('div');

            $scope.allowDragDrop = (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;

            if ($scope.allowDragDrop) {

                var $form = $('#uploadForm');

    			$form.on('drop',                   function(e) { $scope.$apply(function() { $scope.filesToUpload = e.originalEvent.dataTransfer.files; }); });
                $form.on('dragover dragenter',     function( ) { $scope.$apply(function() { $scope.dragOver = true;  }); });
    			$form.on('dragleave dragend drop', function( ) { $scope.$apply(function() { $scope.dragOver = false; }); });
    		    $form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
                    e.preventDefault(); // preventing the unwanted behaviours
                    e.stopPropagation();
                });
            }
        }

        //====================================
        //
        //====================================
        function resData(res) { return res.data; }

	}];