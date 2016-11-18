define(['app', 'angular', 'bootstrap', 'authentication', ], function(app, ng) { 'use strict';

  app.controller('TemplateController', ['$scope', '$rootScope', '$window', '$browser', '$document', '$location', 'authentication', '$q',
	function($scope, $rootScope, $window, $browser, $document, $location, authentication, $q) {

        var basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');

        $rootScope.$on("$routeChangeSuccess", function(){
            $window.ga('set',  'page', basePath+$location.path());
            $window.ga('send', 'pageview');
        });

        $q.when(authentication.getUser()).then(function(u){
            $scope.user = u;
        });

        $scope.$on("signOut", function(){
            $window.location.href = '/';
        });

        $scope.meetingNavCtrl = {
            isSelected : function(name) {

                if(name && $scope.meetingNavCtrl.currentSelection)
                    return name==$scope.meetingNavCtrl.currentSelection;

                var selected = false;

                if(!name || name=='session')    selected = selected || /\/agenda$/.test($location.path());
                if(!name || name=='COP-13')     selected = selected || /\/COP-13\/documents$/i   .test($location.path());
                if(!name || name=='MOP-08')     selected = selected || /\/MOP-08\/documents$/i   .test($location.path());
                if(!name || name=='NP-MOP-02')  selected = selected || /\/NP-MOP-02\/documents$/i.test($location.path());

                return selected;
            },

            goto : function(name) {

                $scope.meetingNavCtrl.currentSelection = name;

                if(name=='session')     return navigate("/meetings/COP-13/agenda?datetime=2016-12-04T00:00-05:00");
                if(name=='COP-13')      return navigate("/meetings/COP-13/documents");
                if(name=='MOP-08')      return navigate("/meetings/MOP-08/documents");
                if(name=='NP-MOP-02')   return navigate("/meetings/NP-MOP-02/documents");
                if(name=='side-events') return navigate('https://www.cbd.int/side-events');
            }
        };

        //============================================================
        //
        //
        //============================================================
        function navigate(url) {

            if(url.indexOf(basePath+'/')!==0) {

                $scope.$applyAsync(function() { $window.location.href = url; });

                return;
            }

            $location.url(url.substr((basePath+'/').length));
        }

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

  }]);
});
