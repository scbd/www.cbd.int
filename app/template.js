define(['app', 'nprogress', 'bootstrap', 'authentication', ], function(app, nprogress) { 'use strict';

  app.controller('TemplateController', ['$scope', '$window', '$browser', '$document', '$location', 'authentication', '$q',
	function($scope, $window, $browser, $document, $location, authentication, $q) {

        $q.when(authentication.getUser()).then(function(u){
            console.log(u);
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
        $scope.actionSignin = function () {
            var client_id    = $window.encodeURIComponent('55asz2laxbosdto6dfci0f37vbvdu43yljf8fkjacbq34ln9b09xgpy1ngo8pohd');
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/oauth2/callback');
            $window.location.href = 'https://accounts.cbd.int/oauth2/authorize?client_id='+client_id+'&redirect_uri='+redirect_uri+'&scope=all';
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionSignOut = function () {
            document.cookie = 'authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/signout?redirect_uri='+redirect_uri;
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
        $scope.actionPassword = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/password?redirect_uri='+redirect_uri;
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionProfile = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/profile?redirect_uri='+redirect_uri;
        };

  }]);
});
