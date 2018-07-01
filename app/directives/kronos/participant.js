define(['app', 'text!./participant.html','./address','services/conference-service','directives/kronos/user-messages'], function(app, html) { 'use strict';

	return app.directive('participant', ['$http','$timeout','conferenceService','$filter','$q',function($http,$timeout,conferenceService,$filter,$q) {

    return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        type:'=',
        binding: "=ngModel",
        showContact: "=showContact",
        organization:"=organization",
        conferenceCode:"=conferenceCode",
        requestId:"=requestId",
        isContact:"=isContact"
      },
			controller: function ($scope ) {
        $scope.countries = []
        $scope.languages = []
        $scope.attending  = false
        $scope.initDoc    = initDoc
        $scope.save       = save

        if(!$scope.binding.meeting ) $scope.binding.meeting =[]

        var conference
        $scope.$watch('binding',function(){
          if($scope.binding.useOrganizationAddress===undefined)
            initDoc()
        })

        function save(){

          if(!$scope.binding._id)
            return $http.post('api/v2018/participants',$scope.binding)
                .then(function(res){
                  $scope.binding._id = res.data.id
                  $scope.showContact=false;
                }).catch(function(err){
                  $scope.error = err
                  console.error(err)
                })
          else
            return $http.put('api/v2018/participants/'+encodeURIComponent($scope.binding._id),$scope.binding)
                .then(function(res){
                  $scope.showContact=false;
                })
                .catch(function(err){
                  $scope.error = err
                  console.error(err)
                })


        }

        function initDoc(){
          if(!$scope.isContact)$scope.attending=true
          $scope.binding.useOrganizationAddress = true
          $scope.binding.requestId = $scope.requestId
          $scope.binding.requestType = $scope.type
          $scope.binding.organization = $scope.organization._id
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



        $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms',{ cache: true })
            .then(function(res){$scope.languages = res.data})

        $http.get('/api/v2015/countries',{ cache: true })
          .then(function(o){return $filter('orderBy')(o.data, 'name.en');})
            .then(function(res){$scope.countries = res})

        $scope.$applyAsync(function(){
            $("[help]").tooltip();
        })
			}
		};
	}]);
});
