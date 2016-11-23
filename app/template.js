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
                var path = basePath + $location.path();

                if(name) selected = selected || path.indexOf(name)===0;
                else     selected = selected || path.indexOf('/conferences/2016')===0;

                return selected;
            },

            hash : function() {
                return $location.hash();
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
