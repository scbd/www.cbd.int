define(['app', 'nprogress', 'bootstrap', 'authentication', ], function(app, nprogress) { 'use strict';

  app.controller('TemplateController', ['$scope', '$window', '$browser', '$document', '$location', 'authentication', '$q',
	function($scope, $window, $browser, $document, $location, authentication, $q) {

        $q.when(authentication.getUser()).then(function(u){
            $scope.user = u;
        });

        $scope.$on("$routeChangeStart", function(e,r){

            if(!r.$$route.progress || r.$$route.progress.start!==false)
                nprogress.start();
        });

        $scope.$on("$routeChangeSuccess", function(e,r){
            if(!r.$$route.progress || r.$$route.progress.stop!==false)
                nprogress.done();
        });

        $scope.$on("signOut", function(e,r){
            $window.location.href = '/';
        });

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
