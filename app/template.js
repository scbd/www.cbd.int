define(['app', 'angular','text!./toast.html', 'text!./template-header.html', 'text!./template-footer.html',
'lodash', 'services/meeting-service', 'providers/realm'], function(app, ng, toastTemplate,headerHtml, footerHtml,_, meetingYearMapping) { 'use strict';

    app.directive('templateHeader', ['$rootScope', '$window', '$browser', '$document', 'authentication', '$q','toastr','$templateCache', '$http', 'meetingService', '$route',
                             function($rootScope,   $window,   $browser,   $document,   authentication,   $q,toastr,$templateCache, $http, meetingService, $route) {
        return {
            restrict: 'E',
            template: headerHtml,
            link: function(scope, elem) {},
            controller: function($scope, $location, $route) {

                angular.element(document).ready(function () {

                    $q.when(meetingService.getActiveMeeting())
                    .then(function(meeting){
                        $scope.meeting = meeting;
                    });   

                });
                $templateCache.put("directives/toast/toast.html", toastTemplate);
                var basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');

                $rootScope.$on('$routeChangeSuccess', function(){
                    $window.ga('set',  'page', basePath+$location.path());
                    $window.ga('send', 'pageview');
                });
                var killWatch = $scope.$watch('user', _.debounce(function(user) {

                    if (!user)
                        return;

                    require(["_slaask"], function(_slaask) {

                        if (user.isAuthenticated) {
                            _slaask.identify(user.name, {
                                'user-id' : user.userID,
                                'name' : user.name,
                                'email' : user.email,
                            });

                            if(_slaask.initialized) {
                                _slaask.slaaskSendUserInfos();
                            }
                        }

                        if(!_slaask.initialized) {
                            _slaask.init('ae83e21f01860758210a799872e12ac4');
                            _slaask.initialized = true;
                            killWatch();
                        }
                    });
                }, 1000));
                updateSize();

                ng.element($window).on('resize', updateSize);

                function updateSize() {
                    $rootScope.$applyAsync(function(){
                        $rootScope.deviceSize = $('.device-size:visible').attr('size');
                    });
                }

                $q.when(authentication.getUser()).then(function(u){
                    $scope.user = u;
                });

                $scope.$on('signOut', function(){
                    $window.location.href = '/';
                });

                $scope.meetingNavCtrl = {
                    fullPath : function(name) {
                        return basePath + $location.path();
                    },

                    isSelected : function(name, exact) {

                        if(name && $scope.meetingNavCtrl.currentSelection)
                            return name==$scope.meetingNavCtrl.currentSelection;

                        var selected = false;
                        var path = basePath + $location.path();
      
                        //handle legacy redirect for /2016/mop-08/documents
                        if(/^\/conferences\/2016\/mop-08/.test(path) && /^\/conferences\/2016\/cp-mop-08/.test(name))
                            selected = true;
                                                        
                        if(exact) selected = selected || path === name;
                        else if(name) selected = selected || path.indexOf(name)===0;
                        else     selected = selected || path.indexOf('/conferences/')===0;

                        return selected;
                    },
                    isMajorEventSelected : function(){
                        if(!$scope.meeting)
                            return;
                        var isSelected = false; 
                        
                        for(var i=0; i<$scope.meeting.conference.events.length; i++){
                            isSelected = $scope.meetingNavCtrl.isSelected('/conferences/'+$scope.meeting.code+
                                        '/'+$scope.meeting.conference.events[i].code+'/')
                            if(isSelected)
                                break;
                        }                
                        return isSelected;
                    },
                    hash : function() {
                        return $location.hash();
                    }
                };                
                
                //============================================================
                //
                //
                //============================================================
                $scope.encodedReturnUrl = function () {
                    return encodeURIComponent($location.absUrl());
                };

                //============================================================
                //
                //
                //============================================================
                $scope.signIn = function () {
                    $window.location.href = authentication.accountsBaseUrl() + '/signin?returnUrl=' + $scope.encodedReturnUrl();
                };

                //============================================================
                //
                //
                //============================================================
                $scope.signOut = function () {
                    authentication.signOut();
                };

                //============================================================
                //
                //
                //============================================================
                $scope.actionSignup = function () {
                    var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
                    $window.location.href = 'https://accounts.cbd.int/signup?redirect_uri='+redirect_uri;
                };

                //============================================================
                //
                //
                //============================================================
                $scope.password = function () {
                    $window.location.href = authentication.accountsBaseUrl() + '/password?returnurl=' + $scope.encodedReturnUrl();
                };

                //============================================================
                //
                //
                //============================================================
                $scope.profile = function () {
                    $window.location.href = authentication.accountsBaseUrl() + '/profile?returnurl=' + $scope.encodedReturnUrl();
                };

                $scope.cssClass = function(code){
                    return (code||'').replace(/\-([a-z]{3})\-.*/, '').toUpperCase();
                }
                //==============================
      //
      //==============================
      $rootScope.$on("showInfo", function(evt, msg) {
          toastr.info(msg);
      });

      //==============================
      //
      //==============================
      $rootScope.$on("showWarning", function(evt, msg) {
          toastr.warning(msg);
      });

      //==============================
      //
      //==============================
      $rootScope.$on("showSuccess", function(evt, msg) {
          toastr.success(msg);
      });

      //==============================
      //
      //==============================
      $rootScope.$on("showError", function(evt, msg) {
          toastr.error(msg);
      });

              }
        };
    }]);

    app.directive('templateFooter', [function() {
        return {
            restrict: 'E',
            template: footerHtml,
            link: function(scope, elem) {},
            controller: function($scope, $location) {}
        };
    }]);

});
