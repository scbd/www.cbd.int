define(['app', 'services/conference-service','providers/locale','directives/kronos/participant','directives/kronos/user-messages','filters/term'], function(app) { 'use strict';

	return ['$scope','$http','conferenceService','$filter','$route','$location','locale','user','$timeout', function( $scope,$http,conferenceService,$filter,$route,$location,locale,user,$timeout) {

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

      {'identifier':'Independent broadcast or film production',             'title':'Independent broadcast or film production'},
      {'identifier':'Weekly publication',     'title':'Weekly publication'},
      {'identifier':'Web publication',     'title':'Web publication'},
      {'identifier':'Online journal',     'title':'Online journal'},
      {'identifier':'Blog',                   'title':'Blog'},
      {'identifier':'Other online media',     'title':'Other online media'},
      {'identifier':'Freelance journalist',     'title':'Freelance journalist'},
      {'identifier':'Other',                  'title':'Other'},
    ]
// _ctrl.msg = [
//   {title:'hello title', description:'helo desciption helo desciption helo desciption helo desciption helo desciption helo desciption', state:'info'},
// {title:'hello title', description:'helo desciption helo desciption helo desciption helo desciption helo desciption helo desciption', state:'warning'},
// {title:'hello title', description:'helo desciption helo desciption helo desciption helo desciption helo desciption helo desciption', state:'danger'},
// {title:'hello title', description:'helo desciption helo desciption helo desciption helo desciption helo desciption helo desciption', state:'success'}
// ]
    var PATTERNS = {
        email : /^http[s]?:\/\/(www.)?facebook.com\/.+/i

    }

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
    _ctrl.conferenceCode     = $route.current.params.conference
    _ctrl.step               = $route.current.params.step || 'request'
    _ctrl.type               = $route.current.params.type


    loadParticipationRequest()
      .then(initSteps)

    //functions
    _ctrl.changeStep         = changeStep
    _ctrl.conferenceSelected = conferenceSelected
    _ctrl.saveCheckList      = saveCheckList
    _ctrl.editOrg            = editOrg
    _ctrl.saveOrganization   = saveOrganization
    _ctrl.saveConference     = saveConference
    _ctrl.hasHead            = hasHead
    _ctrl.hasFocalPoint      = hasFocalPoint
    _ctrl.loadParticipantForm= loadParticipantForm
    _ctrl.mediumHas          = mediumHas
    _ctrl.designationHas     = designationHas
    _ctrl.isStepComplete     = isStepComplete
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
    _ctrl.patterns=PATTERNS


    _ctrl.addContact              = false
    _ctrl.doc                     = {}
    _ctrl.organization            = {}
    _ctrl.organization.medium     = []
    _ctrl.organization.language   = ''

    _ctrl.activeParticipant       = {}
    _ctrl.head                    = {}
    _ctrl.focalPoint              = {}
    _ctrl.participants            = []
    _ctrl.showChecklist           = false
    function initSteps(){

        initStepRequest()
        if(_ctrl.step==='checklist')
          initStepsChecklist()
        if(_ctrl.step==='organization')
          initStepsOrganization()
        if(_ctrl.step==='contacts')
          initStepsContacts()
        if(_ctrl.step==='participants')
          initStepsParticipants()
    }

    function initStepRequest(){
      conferenceService.getFuture()
          .then(function(confrences){
            _ctrl.conferences=confrences
          })
    }
    function initStepsChecklist(){
        if(_ctrl.doc  && _ctrl.doc.checklist){
          $scope.letterOfAssignment = true
          $scope.pressPass = true
          $scope.passport = true
          $scope.accomidations = true
          $scope.head = true
          $scope.focalpoint = true
          $scope.freelance = true
          $scope.onlineJournal = true
          $scope.blog = true
          $scope.otherOnlineMedia = true
          $scope.webPub = true
          $scope.online = true
          $scope.photographer = true
          $scope.radio = true
          $scope.television = true
          $scope.print = true
          $scope.broadcastFilmLetter = true
          $scope.accomidations = true

          return true
        }
        return false
    }
    function initStepsOrganization(){
     $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms',{ cache: true })
      .then(function(res){
        _ctrl.languages = res.data
        getOrg()
      })

    }

    function initStepsContacts(){
      return getOrg().then(function(){
        var headP  = getHead()
        var focalP = getFocalPoint()
        return Promise.all([headP,focalP]).then(function(){
          $timeout(function(){
                $scope.$watch('participationCtrl.head',function(newValue, oldValue){
                  if(newValue._id != oldValue._id){
                    _ctrl.doc.head = newValue._id
                    save()
                  }
                },true)
                $scope.$watch('participationCtrl.focalPoint',function(newValue, oldValue){
                  if(newValue._id != oldValue._id){
                    _ctrl.doc.focalPoint = newValue._id
                    save()
                  }
                },true)
          })
        })
      })
    }
    function initStepsParticipants (){
      return initStepsContacts().then(function(){
        return getParticipants().then(function(){
          $scope.$watch('participationCtrl.activeParticipant._id',function(newValue, oldValue){
            if(newValue!= oldValue && newValue)
              getParticipants()

          })
        })
      })
    }

    function isStepComplete(step){
      if(!_ctrl.doc)return false
      if(stepToNum(_ctrl.doc.currentStep)+1>=stepToNum(step)) return true
      return false
    }
    function stepToNum(step){
      var stepMap ={
        'checklist':0,
        'organization':1,
        'contacts':2,
        'participants':3,
        'complete':4
      }
      return stepMap[step]
    }
    function mediumHas(medium){
      if(!_ctrl.doc || !_ctrl.doc.medium)return false
      for(var i=0; i<_ctrl.doc.medium.length;i++ )
        if(_ctrl.doc.medium[i]===medium)return true
    }

    function designationHas(title){

      if(!_ctrl.doc || !_ctrl.doc.designation)return false

      for(var i=0; i<_ctrl.doc.designation.length;i++ )
        if(_ctrl.doc.designation[i]===title)return true

    }
    function loadParticipantForm (p) {
      console.log('loadParticipantFormloadParticipantFormloadParticipantForm')
      _ctrl.addContact=true;

        _ctrl.activeParticipant = p;

    }

    function getParticipants(){
      if(!_ctrl.doc._id) return new Promise(function(r){r(true)})
      var params = {
                      q : {
                        'meta.createdBy':user.userID,
                        'requestId':_ctrl.doc._id,
                        'meeting':{'$exists':true}
                      },
                      f:{meta:0}
                    }
      return $http.get('api/v2018/participants',{ params : params })
               .then(function(res){
                 if(res.data.length)
                   _ctrl.participants = res.data

                  return _ctrl.participants
               }).catch(function(e){
                 _ctrl.error=e
                 console.error(e)
               })
    }
    function hasHead(){
      return !!_ctrl.head._id
    }

    function hasFocalPoint(){
      return !!_ctrl.focalPoint._id
    }

    function conferenceSelected (conference){
        _ctrl.conferenceId=conference._id
        _ctrl.conferenceCode=conference.code
    }

    function getHead(){
      if(!_ctrl.doc.head) return new Promise(function(r){r(true)})
      return $http.get('api/v2018/participants/'+encodeURIComponent(_ctrl.doc.head),{ cache: true })
          .then(function(res){
            _ctrl.head = res.data
            delete(_ctrl.head.meta)
          }).catch(function(err){
            _ctrl.error = err
            console.error(err)
          })
    }

    function getFocalPoint(){
      if(!_ctrl.doc.focalPoint) return new Promise(function(r){r(true)})
      return $http.get('api/v2018/participants/'+encodeURIComponent(_ctrl.doc.focalPoint),{ cache: true })
          .then(function(res){
            _ctrl.focalPoint = res.data
            delete(_ctrl.focalPoint.meta)
          }).catch(function(err){
            _ctrl.error = err
            console.error(err)
          })
    }

    function getOrg(){
      return $http.get('api/v2018/organizations/'+encodeURIComponent(_ctrl.doc.nominatingOrganization),{ cache: true })
          .then(function(res){
            _ctrl.organization = res.data
            delete(_ctrl.organization.meta)
          }).catch(function(err){
            _ctrl.error = err
            console.error(err)
          })
    }

    function changeStep(step,type){
      if(type==='request')$location.url('/'+step)
      if(type)
        $location.url('/'+_ctrl.conferenceCode+'/'+type+'/'+step)
      else
        $location.url('/'+_ctrl.conferenceCode+'/'+_ctrl.type+'/'+step)
    }

    function saveCheckList(){
        if(!_ctrl.doc.checklist){
          _ctrl.doc.checklist=true
          _ctrl.doc.currentStep = 'organization'
        }
        save()
        changeStep('organization')
    }

    function saveConference(type){
        if(!_ctrl.doc.conference){
          _ctrl.doc.conference = _ctrl.conferenceId
          _ctrl.doc.currentStep = 'checklist'
          _ctrl.doc.requestType = type
          save()
        }
        changeStep('checklist',type)
    }

    function saveOrganization(){
      _ctrl.doc.currentStep = 'contacts'
      if(!_ctrl.organization._id)
        return $http.post('api/v2018/organizations',_ctrl.organization)
            .then(function(res){
              _ctrl.organization._id = res.data.id
              _ctrl.doc.nominatingOrganization = res.data.id
              save()
                .then(function(){
                  changeStep('contacts')
                })
                .catch(function(err){
                  _ctrl.error = err
                  console.error(err)
                })
            }).catch(function(err){
              _ctrl.error = err
              console.error(err)
            })
      else
        return $http.put('api/v2018/organizations/'+encodeURIComponent(_ctrl.organization._id),_ctrl.organization)
            .then(function(res){
              _ctrl.doc.nominatingOrganization = _ctrl.organization._id
              save()
                .then(function(){
                  changeStep('contacts')
                })
                .catch(function(err){
                  _ctrl.error = err
                  console.error(err)
                })
            }).catch(function(err){
              _ctrl.error = err
              console.error(err)
            })
    }

    function save(){
console.log('saving _ctrl.doc',_ctrl.doc)
      if(!_ctrl.doc._id)
        return $http.post('api/v2018/participation-requests',_ctrl.doc)
            .then(function(res){
              _ctrl.doc._id = res.data.id
            }).catch(function(err){
    					console.error(err)
    				})
      else
        return $http.put('api/v2018/participation-requests/'+encodeURIComponent(_ctrl.doc._id),_ctrl.doc)
            .catch(function(err){
              console.error(err)
            })

    }

    function editOrg(){
        $location.url('/'+_ctrl.conferenceCode+'/'+_ctrl.type+'/'+'organization')
    }

    function loadParticipationRequest(){
        var params = {
                        q : {
                          'meta.createdBy':user.userID,
                          'conference':_ctrl.conferenceId
                        }
                      }
        return $http.get('api/v2018/participation-requests',{ params : params })
                 .then(function(res){

                   if(res.data.length){
                    delete(res.data[0].meta)
console.log(res.data[0])
                    return _ctrl.doc = res.data[0]
                   }
                    return null
                 }).catch(function(e){
                   _ctrl.error=e
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
