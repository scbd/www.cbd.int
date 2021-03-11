import _ from 'lodash'
import '~/filters/lstring'
import '~/services/conference-service'
import '~/directives/articles/cbd-article'

export { default as template } from './detect.html'

export default ['$scope', '$http', '$route', '$location', '$window', 'conferenceService', 'authentication', 'user', function($scope, $http, $route, $location, $window, conferenceService, authentication, user) {

    $scope.isAuthenticated = user.isAuthenticated;
    $scope.signIn = signIn;
    $scope.onArticleLoad = function() { delete $scope.loading; } 

    load();

    //====================================
    //
    //====================================
    function signIn() {
      $window.location.href = authentication.accountsBaseUrl()+'/signin?returnUrl='+encodeURIComponent($location.absUrl());
    }

    //====================================
    //
    //====================================
    function load() {

      $scope.loading = true;

      if(!user.isAuthenticated) {

        $scope.articleQuery= [
          {"$match"   : { "adminTags.title.en" : { $all: ['accounts', 'Sign-in', 'Sign-up'] }} },
          {"$sort"    : { "meta.updatedOn":-1}},
          {"$project" : { title:1, content:1, coverImage:1}},
          {"$limit"   : 1 }
        ];

        return;
      }

      var conferenceCode = $route.current.params.conference;
      var type           = $route.current.params.type;

      conferenceService.getConference(conferenceCode).then(function(conference){

        var query = {
          'meta.createdBy': user.userID,
          $or : [ { 'conference': {$oid: conference._id} }, 
                  { 'conference':        conference._id  } ]
        }

        var fields = { _id:1,  currentStep: 1 };
       
        return $http.get('/api/v2018/kronos/participation-requests', { params: { q: query, l:2, f: fields } }).then(resData);

      }).then(function(requests){

        if(requests.length >1) return $location.path('/'+_.map([conferenceCode, type, 'requests'                              ], encodeURIComponent).join('/'));
        if(requests.length==1) return $location.path('/'+_.map([conferenceCode, type, requests[0]._id, requests[0].currentStep || 'checklist'], encodeURIComponent).join('/'));
        
        $location.replace();
        $location.path('/'+_.map([conferenceCode, type, 'checklist'], encodeURIComponent).join('/'));

      }).catch(function(error) {

        $scope.error = error.data || error;
        console.error($scope.error);

      }).finally(function(){
        delete $scope.loading;
      });
    }

    //====================================
    //
    //====================================
    function resData(res) { return res.data; } 

  }];
