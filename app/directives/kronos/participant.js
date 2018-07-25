define(['app', 'text!./participant.html','./address','services/conference-service','directives/kronos/user-messages','directives/file'], function(app, html) { 'use strict';

	return app.directive('participant', ['$http','$timeout','conferenceService','$filter','$q',function($http,$timeout,conferenceService,$filter,$q) {

    return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        typee:'=',
        binding: "=ngModel",
        showContact: "=showContact",
        organization:"=organization",
        conferenceCode:"=conferenceCode",
        requestId:"=requestId",
        isContact:"=isContact"
      },
      link:function($scope){
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
        $scope.dobRegex= /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/

        var conference
        $scope.$watch('binding',function(){
            if($scope.binding.useOrganizationAddress===undefined)
              initDoc()
            if(!$scope.binding.meeting || !$scope.binding.meeting.length){
               $scope.binding.meeting =[]
               if($scope.isContact)
                $scope.attending.val  = false
                else
                  $scope.attending.val  = true
             }else{

               if($scope.binding.meeting && $scope.binding.meeting.length)
                  $scope.attending.val  = true

             }
            if(!$scope.binding.attachment)$scope.binding.attachment=[]



            $timeout(function(){
              $("[help]").tooltip()
            },3000)
        })


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
          return '/api/v2018/kronos/participation-requests/attachment/'+encodeURIComponent(url)
        }

        function save(){
          if($scope.editForm.$invalid) {
            $scope.editForm.$submitted=true
            return $scope.$emit('showError', 'You have errors in your form. ');
          }
          if($scope.binding && $scope.binding.meeting && !$scope.binding.meeting.length)
            delete($scope.binding.meeting)

          if(!$scope.binding._id)
            return $http.post('/api/v2018/kronos/participation-request/participants',$scope.binding,{headers:{requestId:$scope.requestId,conferenceCode:$scope.conferenceCode}})
                .then(function(res){
                  $scope.binding._id = res.data.id
                  $scope.showContact=false;
                  $scope.$emit('showSuccess', 'Participant saved ');
                }).catch(function(err){
                  $scope.error = err
                  console.error(err)
                })
          else
            return $http.put('/api/v2018/kronos/participation-request/participants/'+encodeURIComponent($scope.binding._id),$scope.binding,{headers:{requestId:$scope.requestId,conferenceCode:$scope.conferenceCode}})
                .then(function(res){
                  $scope.showContact=false;
                  $scope.$emit('showSuccess', 'Participant saved ');
                })
                .catch(function(err){
                  $scope.error = err
                  console.error(err)
                })
        }

        function initDoc(){
          if(!$scope.isContact) $scope.attending.val=true
          $scope.binding.useOrganizationAddress = true
          $scope.binding.requestId = $scope.requestId
          $scope.binding.requestType = $scope.typee
          $scope.binding.organization = $scope.organization._id
        }

        function isMedia(media){
          for(var i=0; i<$scope.organization.medium.length; i++)
            if($scope.organization.medium[0]===media)
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
            conference=c[0]
            if(conference && conference.MajorEventIDs)
            conferenceService.getMeetings(conference.MajorEventIDs)
              .then(function(meetings){
                $scope.meetings = meetings
              })
          })

          $scope.onUpload=onUpload
          function onUpload (params, file, error){
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
          function findAttachementIndex ( url){
            if(!Array.isArray($scope.binding.attachment)) return ''
            for (var i = 0; i < $scope.binding.attachment.length; i++) {
              if($scope.binding.attachment.url === url)
                return i
            }
            return ''
          }
          $scope.removeAttachement = removeAttachement
          function removeAttachement (attachment){
            var i = findAttachementIndex ( attachment.url)
            $scope.binding.attachment.splice(i,1)
          }

        $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms',{ cache: true })
            .then(function(res){$scope.languages = res.data})

        var params = {
                        s:{'name.en':1},
                        f:{'name.en':1,code:1}
                      }

        $http.get('/api/v2015/countries',{ params : params })
            .then(function(res){$scope.countries = res.data})
			}
		};
	}]);
});
