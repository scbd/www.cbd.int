import   app          from '~/app'
import   html         from './participant.html'
import { textToHtml } from '~/util/html'

import './address'
import '~/services/conference-service'
import '~/directives/kronos/user-messages'
import '~/directives/file'
import '~/directives/link-or-file'
import participationT from '~/i18n/participation/index.js';

app.directive('participant', ['$http','$timeout','conferenceService','$filter','$q','translationService','locale',function($http,$timeout,conferenceService,$filter,$q, $i18n, locale) {

    return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        typee         : '='              ,
        binding       : "=ngModel"       ,
        showContact   : "=showContact"   ,
        organization  : "=organization"  ,
        conferenceCode: "=conferenceCode",
        requestId     : "=requestId"     ,
        isContact     : "=isContact",
        error         : "=?error",
        msg: '=?msg',
      },
      link:function($scope){

        $i18n.set('participationT', participationT );
        $timeout(function(){
          $("[help]").tooltip();
        },3000)
      },
			controller: function ($scope ) {
        $scope.countries  = []
        $scope.languages  = []
        $scope.attending  = {}
        $scope.attending.val = false
        $scope.initDoc    = initDoc
        $scope.save       = save
        $scope.isMedia    = isMedia
        $scope.isDesignation = isDesignation
        $scope.selectAllMeetings = selectAllMeetings
        $scope.dobRegex= /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/

        $scope.$watch('showContact',function(prev, after){
          if(prev!==after)
            initDoc()
        });

        var conference

        $scope.$watch('binding',function(){
            if(!$scope.binding.meeting || !$scope.binding.meeting.length){
               $scope.binding.meeting =[]
               if($scope.isContact)
                $scope.attending.val  = false
                else
                  $scope.attending.val  = true
             }else{

               if($scope.binding.meeting && $scope.binding.meeting.length){
                  $scope.attending.val  = true
                  selectAllMeetings()
                }
             }
            if(!$scope.binding.attachment)$scope.binding.attachment=[]
            if($scope.addressDuringMeeting && !$scope.showAddressDuringMeeting) $scope.showAddressDuringMeeting=true


            $timeout(function(){
              $("[help]").tooltip()
            },3000)
        })
        
        function selectAllMeetings(){

          if(!$scope.binding.meeting)$scope.binding.meeting=[]
          $scope.editForm.meeting.$setValidity('required',true)
          if($scope.meetings.length === $scope.binding.meeting.length && $scope.attending.val ) return
          $scope.meetings.forEach(pushMeetingId)
          
        }
        
        function pushMeetingId(meeting){
          $scope.binding.meeting.push(meeting._id)
        }
        function resetForm(){
          if($scope.editForm){
            $scope.editForm.$touched = false
            $scope.editForm.$submitted = false
            $scope.editForm.$dirty = false
          }
        }
        $scope.cancel=cancel
        function cancel(){

          if(confirm("Are you sure you want to leave this page?  Any data inputed in this step will be lost without proceeding to the next step.")) {
            $scope.showContact=false;
            initDoc();
          }else return

        }

        function clearMeetings(){
          $scope.binding.meeting =undefined
        }
        $scope.clearMeetings=clearMeetings

        function redirect_blank(url) {
          var a = document.createElement('a');
          a.target="_blank";
          a.href=url;
          a.click();
        }

        $scope.getPresigned = getPresigned
        function getPresigned(url){

          if(!isTemp(url))
            return $http.post('/api/v2018/kronos/participation-requests/'+encodeURIComponent(url)+'/sign').then(function(u){
              redirect_blank(u.data.signedUrl)
            })
          if(isLocal(url))
            redirect_blank(url.replace('http://localhost:8000','http://'+window.location.host))
          else
            redirect_blank(url)
        }
        function isLocal(url){
          if(~url.indexOf('http://localhost:8000'))
            return true
          return false
        }
        function isTemp(url){
          if(~url.indexOf('cbd.documents.temporary')||~url.indexOf('temporary-files'))
            return true
          return false
        }

        $scope.viewAttachment=viewAttachment
        function viewAttachment(url){
          if(!url)return''
          if(~url.indexOf('cbd.documents.temporary')||~url.indexOf('temporary-files'))
            return url
          return '/participation/download/'+encodeURIComponent(url).replace(/%2f/gi, '/');
        }

        function validateRequireUploads(){
          if(!$scope.attending.val)return
          if(isPrintFileValidation())
            return $scope.editForm.$invalid = true

          if(isRadioTVFileValidation())
            return  $scope.editForm.$invalid = true

          if(isPhotoFileValidation())
            return $scope.editForm.$invalid = true
        }

        function isPhotoFileValidation(){
          return ((isDesignation('Photographer') || isMedia('Photo/visual') ) &&
                  (!findAttachement($scope.binding.attachment,'tearSheetOrPhotoOne') ||
                  !findAttachement($scope.binding.attachment,'tearSheetOrPhotoTwo')))
        }

        function isRadioTVFileValidation(){
          return ((isMedia('Radio') || isMedia('Television')) &&
                  (!findAttachement($scope.binding.attachment,'reportRecordingOne') ||
                  !findAttachement($scope.binding.attachment,'reportRecordingTwo')))
        }
        
        function isPrintFileValidation(){
          return (isMedia('Print') &&
              (!findAttachement($scope.binding.attachment,'byLineArticleOne') ||
               !findAttachement($scope.binding.attachment,'byLineArticleTwo') ||
               !findAttachement($scope.binding.attachment,'publicationCopy')
             ))
        }

        function save(){
          validateRequireUploads()

          if($scope.editForm.$invalid) {
            $scope.editForm.$submitted=true;
            $scope.error = { status: 4000 };
            return $scope.$emit('showError', $i18n.get('badRequestTitle', 'participationT'));
          }
          
          if($scope.binding && $scope.binding.meeting && !$scope.binding.meeting.length)
            delete($scope.binding.meeting)

          var props = Object.keys($scope.binding)
          for (var i = 0; i < props.length; i++)
            if(!$scope.binding[props[i]])
              delete($scope.binding[props[i]])


          if(!$scope.binding._id)
            return $http.post('/api/v2018/kronos/participation-request/participants',$scope.binding,{headers:{requestId:$scope.requestId,conferenceCode:$scope.conferenceCode}})
                .then(function(res){
                  $scope.binding._id = res.data.id
                  $scope.showContact=false;
                  $scope.$emit('showSuccess', $i18n.get('participantSaved', 'participationT') );
                }).catch(function(err){
                  $scope.error = err;
                  console.error(err);
                })
          else
            return $http.put('/api/v2018/kronos/participation-request/participants/'+encodeURIComponent($scope.binding._id),$scope.binding,{headers:{requestId:$scope.requestId,conferenceCode:$scope.conferenceCode}})
                .then(function(res){
                  $scope.showContact=false;
                  $scope.$emit('showSuccess', $i18n.get('participantSaved', 'participationT') );
                })
                .catch(function(err){
                  $scope.error = err;
                  console.error(err);
                })
        }

        function initDoc(){

          $scope.editForm.$setPristine()
          $scope.editForm.$setUntouched()
          $scope.editForm.$submitted=false

          if(!$scope.binding._id)
            $scope.binding.useOrganizationAddress = true
          $scope.binding.requestId = $scope.requestId
          $scope.binding.requestType = $scope.typee
          $scope.binding.organization = $scope.organization._id
          $scope.editForm.$submitted=false
          if($scope.attending.val)selectAllMeetings()
          $scope.selectedOptions = {}
          initializeTagModels()
        }

        function isMedia(media){
          for(var i=0; i<$scope.organization.medium.length; i++)
            if($scope.organization.medium[i]===media)
              return true
          return false
        }

        function isDesignation(designation){
          if($scope.binding.designation === designation)
              return true
          return false
        }

        conferenceService.getConference($scope.conferenceCode)
          .then(function(c){
            conference=c
            if(conference && conference.MajorEventIDs)
            conferenceService.getMeetings(conference.MajorEventIDs)
              .then(function(meetings){

                for (const aMeeting of meetings) {
                  const title = aMeeting.title[locale] || aMeeting.title['en'];
                  const code = aMeeting.titleShort || aMeeting.EVT_CD;

                  aMeeting.name = `${code} - ${title}`
                }
                $scope.meetings = meetings
                selectAllMeetings()
                initRegOptions()
              })
          })

          $scope.onUpload=onUpload

          function onUpload (params, file, error){
            if(error) return
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

          $scope.findAttachement = findAttachement
          function findAttachement (attachments, searchParam){
            if(!Array.isArray(attachments)) return ''
            for (var i = 0; i < attachments.length; i++) {
              if(attachments[i].url === searchParam || (attachments[i].tag && attachments[i].tag === searchParam) || (attachments[i].title && attachments[i].title === searchParam))
                return attachments[i]
            }
            return ''
          }

          function findAttachementIndex (url){
            if(!Array.isArray($scope.binding.attachment)) return -1
            for (var i = 0; i < $scope.binding.attachment.length; i++) {
              if($scope.binding.attachment[i].url === url)
                return i
            }
            return -1
          }

          $scope.removeAttachement = removeAttachement
          function removeAttachement (attachment){
            var i = findAttachementIndex (attachment.url)

            if(~i)
              $scope.binding.attachment.splice(i,1)
          }

          $scope.isTemp = isTemp
          function isTemp (url){
            return ~url.indexOf('temporary-files')
          }


          $scope.selectedOptions = $scope.selectedOptions? $scope.selectedOptions : {}
          function initRegOptions() {
            const { globalTags: registrationOptions = [] } = conference?.registrationOptions || {}

            $scope.registrationOptions = registrationOptions.map(registrationOptionsMap);
            updateRegOptions()
            
          }

          function initializeTagModels(){
            if(!$scope.binding?.tags || !$scope.binding?.tags.length) return 

            for (const op of $scope.registrationOptions) {
              const theOption = op.options.find((o)=> ($scope.binding.tags || []).includes(o.value)) 

              if(!theOption) continue

              op.selectedOption = theOption.value
            }
            updateRegOptions()
          }

          function registrationOptionsMap({ title, description, options:gtOptions, conditions = [] } ){
            const options        = gtOptions.map(selectBoxOptionMap);
            const selectedOption = gtOptions.find((o) => ($scope.binding.tags || []).includes(o.tag))?.tag || undefined;

            return { title, options, conditions, description: textToHtml(description), selectedOption }
          }

          function selectBoxOptionMap({ tag, title: label, notes: rawNotes = '' }){
            const notes = textToHtml(rawNotes)
            const value = tag || undefined

            return { value, label, notes }
          }

          $scope.updateRegOptions = updateRegOptions
          function updateRegOptions() {

            const tags = $scope.registrationOptions.map(({ selectedOption }) => selectedOption).filter( x => x )

            for (const option of  $scope.registrationOptions) {
              option.enabled = testTagConditions(option.conditions, tags);

              if(!option.enabled) option.selectedOption = undefined
              option.optionNotes = option.options.find((o) => tags.includes(o.value))?.notes;
            }

            $scope.binding.tags = $scope.registrationOptions.map(({ selectedOption }) => selectedOption).filter( x => x )

            if(!tags.length) delete($scope.binding.tags)
          }

          function testTagConditions(conditions, tags) {
            const allRe = /^&/;
            const notRe = /^!/;
          
            const all = conditions.filter((o) => allRe.test(o)).map((o) => o.replace(allRe, ''));
            const not = conditions.filter((o) => notRe.test(o)).map((o) => o.replace(notRe, ''));
            const any = conditions.filter((o) => !notRe.test(o) && !allRe.test(o));
          
            if (all.length && !all.every((t) => tags.includes(t))) return false;
            if (not.length &&  not.some((t) => tags.includes(t))) return false;
            if (any.length && !any.some((t) => tags.includes(t))) return false;
          
            return true;
          }

        $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms',{ cache: true })
            .then(function(res){
              

              for (const aLang of res.data)
                aLang.name = aLang.title[locale] || aLang.title['en']
              
              $scope.languages = res.data
            })

        var params = {
                        s:{[`name.${locale}`]:1},
                        f:{'name':1,code:1}
                      }

                      function localizeCountry(data){
                        for (const c of data)
                          c.title = c.name[locale] || c.name['en']
          
                        $scope.countries = data
  
                        return data
                      }

        $http.get('/api/v2015/countries',{ params : params })
            .then(function(res){return res.data}).then(localizeCountry)
			}
		};
	}]);