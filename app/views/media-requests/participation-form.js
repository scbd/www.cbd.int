import 'ngSmoothScroll'
import '~/services/conference-service'
import '~/providers/locale'
import '~/directives/kronos/participant'
import '~/directives/kronos/user-messages'
import '~/filters/term'
import '~/directives/file'
import '~/services/translation-service'
import participationT from '~/i18n/participation/index.js';

import { camelCase } from 'change-case';
export { default as template } from './participation-form.html'

export default ['$scope','$http','conferenceService','$filter','$route','$location','locale','user','$timeout','$document','$q','smoothScroll','translationService', function( $scope,$http,conferenceService,$filter,$route,$location,locale,user,$timeout,$document,$q,smoothScroll,$i18n) {

		const _ctrl = this

    $i18n.set('participationT', participationT);

    var orgTypes = {media:[
      {'identifier':'Educational/Public', 'title': $i18n.get(camelCase('Educational/Public'), 'participationT')},
      {'identifier':'Government/State',   'title': $i18n.get(camelCase('Government/State'), 'participationT') },
      {'identifier':'Private',            'title': $i18n.get(camelCase('Private'), 'participationT') },
      {'identifier':'Other',              'title': $i18n.get(camelCase('Other'), 'participationT') }],
      observer:[]
    }

    var mediums = [
      {'identifier':'Print',                  'title': $i18n.get(camelCase('Print'), 'participationT') },
      {'identifier':'News agency/service',    'title': $i18n.get(camelCase('newsAgencyService'), 'participationT') },
      {'identifier':'Radio',                  'title': $i18n.get(camelCase('Radio'), 'participationT') },
      {'identifier':'Photo/visual',           'title': $i18n.get(camelCase('photoVisual'), 'participationT') },
      {'identifier':'Television',             'title': $i18n.get(camelCase('Television'), 'participationT') },

      {'identifier':'Independent broadcast or film production', 'title': $i18n.get(camelCase('Independent broadcast or film production'), 'participationT') },
      {'identifier':'Weekly publication'                      , 'title': $i18n.get(camelCase('Weekly publication'), 'participationT'                      ) },
      {'identifier':'Web publication'                         , 'title': $i18n.get(camelCase('Web publication' ), 'participationT'                        ) },
      {'identifier':'Online journal'                          , 'title': $i18n.get(camelCase('Online journal'), 'participationT'                          ) },
      {'identifier':'Blog'                                    , 'title': $i18n.get(camelCase('Blog'), 'participationT'                                    ) },
      {'identifier':'Other online media'                      , 'title': $i18n.get(camelCase('Other online media') , 'participationT'                     ) },
      {'identifier':'Freelance journalist'                    , 'title': $i18n.get(camelCase('Freelance journalist') , 'participationT'                   ) },
      {'identifier':'Other'                                   , 'title': $i18n.get(camelCase('Other') , 'participationT'                                  ) },
    ]

    var MIMES = {
        'application/pdf':                                                            { title: $i18n.get(camelCase('PDF'), 'participationT'),               color: 'red',    btn: 'btn-danger',  icon: 'fa-file-pdf-o'   },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { title: $i18n.get(camelCase('Word (docx)'), 'participationT'),       color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/msword':                                                         { title: $i18n.get(camelCase('Word (doc)'), 'participationT'),        color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { title: $i18n.get(camelCase('Excel (xlsx)'), 'participationT'),      color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.ms-excel':                                                   { title: $i18n.get(camelCase('Excel (xls)'), 'participationT'),       color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { title: $i18n.get(camelCase('PowerPoint (pptx)'), 'participationT'), color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/vnd.ms-powerpoint':                                              { title: $i18n.get(camelCase('PowerPoint (ppt)'), 'participationT'),  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/zip':                                                            { title: $i18n.get(camelCase('Zip'), 'participationT'),               color: '',       btn: 'btn-default', icon: 'fa-file-archive-o' },
        'default':                                                                    { title: '',                  color: 'orange', btn: 'btn-default', icon: 'fa-file-o' }
    }

    //route params
    _ctrl.conferenceCode     = $route.current.params.conference
    _ctrl.step               = $route.current.params.step || 'request'
    _ctrl.type               = $route.current.params.type

    //functions
    _ctrl.save               = save
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
    _ctrl.saveContacts       = saveContacts
    _ctrl.showChecklist      = showChecklist
    _ctrl.numParticipants    = numParticipants
    _ctrl.loading            = false
    _ctrl.loadingObj         = {}
    _ctrl.isSameAsHead       = isSameAsHead
    _ctrl.toggleMainIsHead   = toggleMainIsHead        
    // options
    _ctrl.orgTypes           = orgTypes[_ctrl.type]
    _ctrl.orgMediums         = mediums
    _ctrl.locale             = locale
    _ctrl.jumpToDashboard    = function() { jumpTo(null, 'requests'); };
    _ctrl.partialMap         = {
      'request'         : '/app/views/media-requests/participation-form-conference.html',
      'checklist'       : '/app/views/media-requests/participation-form-checklist.html',
      'organization'    : '/app/views/media-requests/participation-form-organization.html',
      'contacts'        : '/app/views/media-requests/participation-form-contacts.html',
      'participants'    : '/app/views/media-requests/participation-form-participants.html',
      'finished'        : '/app/views/media-requests/participation-form-finished.html'
    }

    //flags
    _ctrl.addContact              = false


    //model inits
    _ctrl.doc                     = {}
    _ctrl.organization            = {}
    _ctrl.organization.medium     = []
    _ctrl.organization.language   = ''
    _ctrl.organization.attachment = []
    _ctrl.activeParticipant       = {}
    _ctrl.head                    = {}
    _ctrl.focalPoint              = {}
    _ctrl.participants            = []
    _ctrl.config                  = {sameAsHead:false}

    
    var loadingCheck = false
    $scope.$watch('participationCtrl.loadingObj',function(){
      if(!loadingCheck){
        loadingCheck = true
        _ctrl.loading = true
        $timeout(function(){
          _ctrl.loading = loading()
          loadingCheck = false
        },400)
      }
    },true);

    initStepRequest().then(loadParticipationRequest).then(initSteps)

    _ctrl.genMeta=genMeta
    function genMeta(){
      return {requestid:_ctrl.doc._id,conferencecode:_ctrl.conferenceCode}
    }
    _ctrl.viewAttachment=viewAttachment
    function viewAttachment(url){
      if(!url)return''
      if(~url.indexOf('cbd.documents.temporary')||~url.indexOf('temporary-files'))
        return url
      return '/participation/download/'+encodeURIComponent(url).replace(/%2f/gi, '/');

    }
    
    function toggleMainIsHead(){

      if(!_ctrl.config.sameAsHead){
        delete(_ctrl.doc.focalPoint)
        _ctrl.focalPoint={}
      } else{
        _ctrl.doc.focalPoint = _ctrl.doc.head
        _ctrl.focalPoint=_ctrl.head
      }
    }

    function isSameAsHead(){
      return _ctrl.doc.focalPoint === _ctrl.doc.head
    }
        
    function numParticipants(){
      var count = 0
      for (var i = 0; i < _ctrl.participants; i++)
        if(_ctrl.participants[i].meeting && _ctrl.participants[i].meeting.length)
          count++
      return count
    }

    function showChecklist(){
      $scope.showChecklist=true;
      if(!_ctrl.doc.list)
        _ctrl.doc.list={}
      _ctrl.save();
      $timeout(function(){
        var element = document.getElementById('checklist');
        smoothScroll(element)
      })
    }
    function loading(){
      var props = Object.keys(_ctrl.loadingObj)
      for (var i = 0; i < props.length; i++)
        if(_ctrl.loadingObj[props[i]])
          return true

      return false
    }
    function loadPresigned(url){
      var atts = _ctrl.organization.attachment

      for (var i = 0; i < atts.length; i++)
        if(!isTemp(atts[i].url))
          getPresigned(i,atts[i].url)
    }

    function redirect_blank(url) {
      var a = document.createElement('a');
      a.target="_blank";
      a.href=url;
      a.click();
    }

    _ctrl.getPresigned = getPresigned
    function getPresigned(url){

      if(!isTemp(url))
        return $http.post('/api/v2018/kronos/participation-requests/'+encodeURIComponent(url)+'/sign').then(function(u){
          redirect_blank(u.data.signedUrl)
        })
      else
        return url
    }

    function isTemp(url){
      if(~url.indexOf('cbd.documents.temporary')||~url.indexOf('temporary-files'))
        return true
      return false
    }

    function initSteps(){

      if(_ctrl.doc.requested && !~user.roles.indexOf('SCBDMedia'))
       return changeStep('finished',_ctrl.type)

      if(_ctrl.step==='checklist')
        initStepsChecklist()
      if(_ctrl.step==='organization')
        initStepsOrganization()
      if(_ctrl.step==='contacts')
        initStepsOrganization().then(initStepsContacts)
      if(_ctrl.step==='participants')
        initStepsOrganization().then(initStepsParticipants)
      if(_ctrl.step==='finished')
        initStepsFinished()

      window.scroll(0, 0)
      $scope.$applyAsync(function(){
          $("[help]").tooltip();
      })
    }

    function initStepsFinished() {

      delete _ctrl.showDashboardButton;

      var query = { 'meta.createdBy':user.userID, $or : [ { 'conference': {$oid:_ctrl.conferenceId} }, { conference: _ctrl.conferenceId } ] }
      
      return $http.get('/api/v2018/kronos/participation-requests',{ params : { q: query, l:2, f:{_id:1} } }).then(function(res){
        _ctrl.showDashboardButton = res.data.length>1;
      });
    }

    function initStepRequest(){
      return conferenceService.getFuture()
          .then(function(confrences){
            _ctrl.conferences=confrences
          }).then(function(){
            initConference()
          })
    }
    function initConference(){
      for(var i=0; i<_ctrl.conferences.length;i++)
        if(_ctrl.conferences[i].code===_ctrl.conferenceCode){
          _ctrl.conferenceId   = _ctrl.conferences[i]._id
          _ctrl.doc.conference = _ctrl.conferences[i]._id
        }
    }
    function getConference(id){
      for(var i=0; i<_ctrl.conferences.length;i++)
        if(_ctrl.conferences[i]._id===id)
          return _ctrl.conferences[i]
    }
    function getConferenceCode(id){
      return getConference(id).code

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

          _ctrl.showChecklist();

          return true
        }
        return false
    }

    function initStepsOrganization(){
     return $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms',{ cache: true })
      .then(function(res){

        for (const aLang of res.data)
          aLang.name = aLang.title[locale]

        _ctrl.languages = res.data

        return getOrg()
      })
    }
    _ctrl.initStepsContacts=initStepsContacts
    function initStepsContacts(){

      if(_ctrl.doc.nominatingOrganization)
        return getOrg().then(function(){
          var headPromise  = getHead()
          var focalP = getFocalPoint()
          return $q.all([headPromise,focalP]).then(function(){
                  _ctrl.config.sameAsHead = _ctrl.isSameAsHead()
            
                  $scope.$watch('participationCtrl.head._id',function(newValue, oldValue){
                    if(newValue != oldValue){
                      _ctrl.doc.head = newValue
                      save()
                    }

                  })
                  $scope.$watch('participationCtrl.focalPoint._id',function(newValue, oldValue){
                    if(newValue != oldValue){
                      _ctrl.doc.focalPoint = newValue
                      save()
                    }
                  })
          })
        })
    }

    function initStepsParticipants (){
      if(_ctrl.doc.nominatingOrganization)
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

      if(stepToNum(_ctrl.doc.currentStep)>=stepToNum(step)) return true

      if(_ctrl.doc.currentStep==='finished') return true
      return false
    }

    function stepToNum(step){
      var stepMap ={
        'checklist':0,
        'organization':1,
        'contacts':2,
        'participants':3,
        'finished':4
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

      _ctrl.addContact=true;

        _ctrl.activeParticipant = {};
        $scope.$applyAsync(function(){_ctrl.activeParticipant=p})

    }

    function getParticipants(){
      _ctrl.loadingObj.getParticipants = true
      var deferred = $q.defer()
      deferred.resolve(true)
      if(!_ctrl.doc._id) return deferred.promise
      var params = {
                      q : {
                        'meta.createdBy':user.userID,
                        $or : [ { requestId : { $oid:_ctrl.doc._id } }, { requestId : _ctrl.doc._id }],
                        'meeting':{'$exists':true}
                      },
                      f:{meta:0},
                      rp:'primary'
                    }
      return $http.get('/api/v2018/kronos/participation-request/participants',{ params : params })
               .then(function(res){
                 if(res.data.length)
                   _ctrl.participants = res.data
                   _ctrl.loadingObj.getParticipants = false
                  return _ctrl.participants
               }).catch(function(e){
                 _ctrl.error=e
                 _ctrl.loadingObj.getParticipants = false
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
      _ctrl.loadingObj.getHead = true
      var deferred = $q.defer()
      deferred.resolve(true)

      if(!_ctrl.doc.head) {
         _ctrl.loadingObj.getHead = false
         return deferred.promise
      }
      return $http.get('/api/v2018/kronos/participation-request/participants/'+encodeURIComponent(_ctrl.doc.head), { params : { rp:'primary' }})
          .then(function(res){
            _ctrl.head = res.data
            _ctrl.loadingObj.getHead = false
            delete(_ctrl.head.meta)
          }).catch(function(err){
            _ctrl.error = err
            _ctrl.loadingObj.getHead = false
            console.error(err)
          })
    }

    function getFocalPoint(){
      _ctrl.loadingObj.getFP = true
      var deferred = $q.defer()
      deferred.resolve(true)
      if(!_ctrl.doc.focalPoint){
        _ctrl.loadingObj.getFP = false
         return deferred.promise
      }
      return $http.get('/api/v2018/kronos/participation-request/participants/'+encodeURIComponent(_ctrl.doc.focalPoint), { params : { rp:'primary' } })
          .then(function(res){
            _ctrl.focalPoint = res.data
            _ctrl.loadingObj.getFP = false
            delete(_ctrl.focalPoint.meta)
          }).catch(function(err){
            _ctrl.error = err
            _ctrl.loadingObj.getFP = false
            console.error(err)
          })
    }

    function getOrg(){
      _ctrl.loadingObj.getOrg = true
      if(_ctrl.doc.nominatingOrganization)
        return $http.get('/api/v2018/kronos/participation-request/organizations/'+encodeURIComponent(_ctrl.doc.nominatingOrganization), { params : { rp:'primary' } })
            .then(function(res){
              _ctrl.organization = res.data
              if(!_ctrl.organization.attachment)_ctrl.organization.attachment=[]
              _ctrl.loadingObj.getOrg = false
              delete(_ctrl.organization.meta)
            }).catch(function(err){
              _ctrl.error = err
              _ctrl.loadingObj.getOrg = false
              console.error(err)
            })
      else{
        _ctrl.loadingObj.getOrg = false
        return false
      }
    }

    function changeStep(step,type){

      if( (_ctrl.editForm && _ctrl.editForm.$dirty) ||
          (_ctrl.editFormOrg && _ctrl.editFormOrg.$dirty) ||
          _ctrl.addContact)
        if(!confirm("Are you sure you want to leave this page?  Any data inputed in this step will be lost without proceeding to the next step."))
          return

      initStepsOrganization().then(initStepsContacts)

      if(type==='request')$location.url('/'+step)

      if(!isStepComplete(step)&& step!=='finished'){
          var e = new Error('STEP_NOT_COMPLETE')
          e.status="STEP_NOT_COMPLETE"
          this.error=e
         return
       }
       jumpTo(type, step);
    }

    function jumpTo(type, step, replace) {

      var segments = [ _ctrl.conferenceCode, type || _ctrl.type ];

      if(step!='requests')
        segments.push(_ctrl.requestId);

      segments.push(step  || _ctrl.step)

      if(replace)
        $location.replace();

      $location.path('/'+_.map(segments, encodeURIComponent).join('/'));
    }

    function resetForms(){
      if(_ctrl.editForm){
        _ctrl.editForm.$touched = false
        _ctrl.editForm.$submitted = false
        _ctrl.editForm.$dirty = false
      }
      if(_ctrl.editFormOrg){
        _ctrl.editFormOrg.$touched = false
        _ctrl.editFormOrg.$submitted = false
        _ctrl.editFormOrg.$dirty = false
      }
    }

    function saveCheckList(){
        if(!_ctrl.doc.checklist){
          _ctrl.doc.checklist=true
          _ctrl.doc.currentStep = 'organization'
        }
        save().then(function(isSaved){
          if(isSaved){
            $scope.$emit('showSuccess', i18n.get('checklistSaved', 'participationT'));
            resetForms()
            changeStep('organization')
          }
        })

    }
    function saveContacts(){

        _ctrl.doc.currentStep = 'participants'

        save().then(function(isSaved){
          if(isSaved){
            $scope.$emit('showSuccess', $i18n.get('contactsSaved', 'participationT'));
            resetForms();
            changeStep('participants')
          }
        })

    }
    function saveConference(type){

      if(!_ctrl.doc) throw new Error('no doc found')
        if(!_ctrl.doc.conference){
          _ctrl.doc.conference = _ctrl.conferenceId
          _ctrl.doc.currentStep = 'checklist'
          _ctrl.doc.requestType = type
          save().then(function(){resetForms()})
        }
        resetForms()
        changeStep('checklist',type)
    }

    function saveOrganization(){

      if(_ctrl.editFormOrg && (_ctrl.editFormOrg.$invalid || !_ctrl.findAttachement(_ctrl.organization.attachment,'letterOfAssignment')))
      {
        _ctrl.editFormOrg.$submitted=true

        _ctrl.error = { status: 4000 }
        return $scope.$emit('showError', $i18n.get('badRequestTitle', 'participationT'));
      }

      if(!_ctrl.organization.requestId)
        _ctrl.organization.requestId = _ctrl.requestId

      if(!_ctrl.organization._id)
        return $http.post('/api/v2018/kronos/participation-request/organizations',_ctrl.organization,{headers:{requestId:_ctrl.requestId,conferenceCode:_ctrl.conferenceCode}})
            .then(function(res){
              _ctrl.organization._id = res.data.id
              _ctrl.doc.nominatingOrganization = res.data.id
              _ctrl.doc.currentStep = 'contacts'
              save()
                .then(function(isSaved){
                  if(isSaved){

                    $scope.$emit('showSuccess', $i18n.get('orgSaved', 'participationT'));
                    resetForms()
                    changeStep('contacts')
                  }


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
        return $http.put('/api/v2018/kronos/participation-request/organizations/'+encodeURIComponent(_ctrl.organization._id),_ctrl.organization,{headers:{requestId:_ctrl.doc._id,conferenceCode:_ctrl.conferenceCode}})
            .then(function(res){
              _ctrl.doc.nominatingOrganization = _ctrl.organization._id
              _ctrl.doc.currentStep = 'contacts'
              save()
                .then(function(isSaved){
                  if(isSaved){

                    $scope.$emit('showSuccess', $i18n.get('orgSaved', 'participationT'));
                    resetForms()
                    changeStep('contacts')
                  }

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

      if(!_ctrl.doc._id)
        return $http.post('/api/v2018/kronos/participation-requests',_ctrl.doc)
            .then(function(res){
              _ctrl.doc._id = res.data.id
              _ctrl.requestId = _ctrl.doc._id
              resetForms()

              jumpTo(null, null, true);

              return true
            })
            .catch(function(err){
              _ctrl.error = err
    					console.error(err)
              return false
    				})
      else
        return $http.put('/api/v2018/kronos/participation-requests/'+encodeURIComponent(_ctrl.doc._id),_ctrl.doc)
            .then(function(res){
              resetForms()
              return true
            })
            .catch(function(err){
              _ctrl.error = err
              console.error(err)
              return false
            })

    }

    function editOrg(){
        $location.url('/'+_ctrl.conferenceCode+'/'+_ctrl.type+'/'+'organization')
    }

    function loadParticipationRequest(){

        var requestId = $route.current.params.requestId;

        if(!requestId && _ctrl.step!='checklist') {
          throw new Error("requestId is mandatory for steps other than checklist");
        }

        var query = {
          '_id' : requestId ? {$oid: requestId } : 0, // _id: 0 => force NEW record
          'meta.createdBy':user.userID,
          $or : [ { 'conference': {$oid:_ctrl.conferenceId} }, { conference: _ctrl.conferenceId } ]
        }
        
        return $http.get('/api/v2018/kronos/participation-requests',{ params : { q: query, rp:'primary' } })
                 .then(function(res){

                  if(requestId && !res.data.length)
                   throw new Error("Request not found");

                   if(res.data.length){
                     if(res.data[0].conference)
                       _ctrl.conferenceCode=getConferenceCode(res.data[0].conference)

                     if(res.data[0].requestType)
                       _ctrl.type=res.data[0].requestType

                      if(res.data[0]._id)
                        _ctrl.requestId = res.data[0]._id
                        
                      delete(res.data[0].meta)
                      return _ctrl.doc = res.data[0]
                    }
                    return null
                 }).catch(function(e){
                   _ctrl.error=e
                 })
    }

    $scope.$applyAsync(function(){
        $("[help]").tooltip();
    })

    _ctrl.onUpload=onUpload
    function onUpload (params, file, error){
      if(error)
        return _ctrl.error =error
      var exists = findAttachement(params.container.attachment,params.tag)

      if(!exists){
        var newAttch = {}
        if(params.tag)newAttch.tag = params.tag
        newAttch.url = file.url
        newAttch.title = file.metadata.fileName
        params.container.attachment.push(newAttch)
      } else{
        if(params.tag)exists.tag = params.tag
        exists.url = file.url
        exists.title = file.metadata.fileName
      }
    }

    _ctrl.findAttachement = findAttachement
    function findAttachement (attachments, searchParam){
      if(!Array.isArray(attachments)) return ''
      for (var i = 0; i < attachments.length; i++) {
        if(attachments[i].url === searchParam || (attachments[i].tag && attachments[i].tag === searchParam) || (attachments[i].title && attachments[i].title === searchParam))
          return attachments[i]
      }
      return ''
    }
    function findAttachementIndex ( url){
      if(!Array.isArray(_ctrl.organization.attachment)) return -1

      for (var i = 0; i < _ctrl.organization.attachment.length; i++) {
        if(_ctrl.organization.attachment[i].url === url)
          return i
      }
      return -1
    }
    _ctrl.removeAttachement = removeAttachement
    function removeAttachement (attachment){

      var i = findAttachementIndex ( attachment.url)

      if(~i)
        _ctrl.organization.attachment.splice(i,1)
    }

    _ctrl.submit=submit
    function submit (){
      $http.put('/api/v2018/kronos/participation-requests/'+encodeURIComponent(_ctrl.doc._id)+'/submit',_ctrl.doc)
      .then(function(){
        $scope.$emit('showSuccess', 'Participant(s) Saved and Request Submitted');
        changeStep('finished')
      }).catch(function(err){
        _ctrl.error=err
        console.error(err)
      })
    }

	}];
