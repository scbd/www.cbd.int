define(['app', 'services/conference-service','providers/locale','directives/kronos/participant'], function(app) { 'use strict';

	return ['$scope','$http','conferenceService','$filter','$route','$location','locale','user', function( $scope,$http,conferenceService,$filter,$route,$location,locale,user) {

		var _ctrl 		           = this
    var orgTypes = {media:[
      {'identifier':'Educational/Public', 'title':'Educational/Public'},
      {'identifier':'Government/State',   'title':'Government/State'},
      {'identifier':'Private',            'title':'Private'},
      {'identifier':'Other',              'title':'Other'}],
      observer:[]
    }
    "Print","News agency/service","Radio","Photo/visual","Television","Weekly publication","Other"
    var mediums = [
      {'identifier':'Print',                  'title':'Print'},
      {'identifier':'News agency/service',    'title':'News agency/service'},
      {'identifier':'Radio',                  'title':'Radio'},
      {'identifier':'Photo/visual',           'title':'Photo/visual'},
      {'identifier':'Television',             'title':'Television'},
      {'identifier':'Weekly publication',     'title':'Weekly publication'},
      {'identifier':'Other',                  'title':'Other'},
    ]


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
    }

    //route params
    _ctrl.conferenceId       = $route.current.params.conference
    _ctrl.step               = $route.current.params.step || 'request'
    _ctrl.type               = $route.current.params.type

    loadParticipationRequest()
      .then(initSteps)

    //functions
    _ctrl.changeStep         = changeStep
    _ctrl.conferenceSelected = conferenceSelected
    _ctrl.saveCheckList      = saveCheckList
    _ctrl.editOrg            = editOrg

    // options
    _ctrl.orgTypes           = orgTypes[_ctrl.type]
    _ctrl.orgMediums         = mediums
    _ctrl.locale             = locale
    _ctrl.partialMap         = {
      'request'         : '/app/views/kronos/participation-form-conference.html',
      'checklist'       : '/app/views/kronos/participation-form-checklist.html',
      'organization'    : '/app/views/kronos/participation-form-organization.html',
      'contacts'        : '/app/views/kronos/participation-form-contacts.html',
      'participants'    : '/app/views/kronos/participation-form-participants.html',
    }

    _ctrl.addContact         = false
    _ctrl.doc                = {}
    $scope.organization      = {}


    function initSteps(){
        if(!_ctrl.conferenceId)
          initStepRequest()

        if(initStepsChecklist() && !_ctrl.participationRequest.nominatingOrganization)
          initStepsOrganization()
    }

    function initStepRequest(){
      conferenceService.getFuture()
          .then(function(confrences){
            _ctrl.conferences=confrences
          })
    }
    function initStepsChecklist(){
        if(_ctrl.participationRequest  && _ctrl.participationRequest.checklist){
          $scope.letterOfAssignment = true
          $scope.pressPass = true
          $scope.passport = true
          $scope.accomidations = true
          $scope.head = true
          $scope.focalpoint = true
          return true
        }
        return false
    }
    function initStepsOrganization(){
      $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms',{ cache: true })
          .then(function(res){_ctrl.languages = res.data})
    }

    function conferenceSelected (conference){
        _ctrl.conferenceId=conference.code
    }

    function changeStep(step,type){

      if(type)
        $location.url('/'+_ctrl.conferenceId+'/'+type+'/'+step)
      else
        $location.url('/'+_ctrl.conferenceId+'/'+_ctrl.type+'/'+step)
    }

    function saveCheckList(){
        _ctrl.doc.checklist=true
        save()
        changeStep('organization')
    }

    function save(){
      if(!_ctrl.doc._id)
        $http.post('/api/v2018/participation-requests',_ctrl.doc)
            .then(function(res){
              _ctrl.doc._id = res.data._id
            }).catch(function(err){
    					console.error(err)
    				})
      else
        $http.put('/api/v2018/participation-requests/'+encodeURIComponent(_ctrl.doc._id),_ctrl.doc)
            .catch(function(err){
              console.error(err)
            })

    }

    function editOrg(){
        $location.url($location.url('/'+_ctrl.conferenceId+'/'+_ctrl.type+'/'+'organization'))
    }

    function loadParticipationRequest(){
        return $http.get('/api/v2018/participation-requests',{ params : { q : { 'meta.createdBy':user.userID }} })
                 .then(function(res){
                   console.log(res.data[0])
                   if(res.data.length)
                    return _ctrl.participationRequest = res.data[0]

                    return null
                 })
    }
//====================================
//
//====================================
function processFiles(files) {

        if(!files || !files.length)
            return;

        _.forEach(files, function(f){

            var file = f

            file.status="pending";

                 if(!MIMES[file.type]) file.error="TYPE";


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
    $scope.$applyAsync(function(){
        $("[help]").tooltip();
    })
	}];
});
// conferenceService.getConference('sbstta-sbi')
//   .then(function(c){
//     console.log('c',c)
//   })
// conferenceService.getMeetings(confrence.MajorEventIDs)
//   .then(function(meetings){
//     _ctrl.meetings = meetings
//   })
