define(['app', 'authentication'], function(app) { 'use strict';

  app.controller('NRTemplateController', ['$scope', '$window', '$cookies', '$document', '$location', 'authentication',
	function($scope, $window, $cookies, $document, $location) {

        $scope.$root.pageTitle = { text: "not set" };

        $scope.doSearch = function () {
          $window.location.href='http://chm.cbd.int/database/?keywords=' + $scope.searchQuery;
          $scope.searchQuery = '';
      };

        //============================================================
        //
        //
        //============================================================
		function setCookie (name, value, days, path) {

            var cookieString = $window.escape(name) + '=';

            if(value) cookieString += $window.escape(value);
            else      days = -1;

            if(path)
                cookieString += '; path=' + path;

            if(days || days === 0) {

                var expirationDate = new Date();

                expirationDate.setDate(expirationDate.getDate() + days);

                cookieString += '; expires=' + expirationDate.toUTCString();
            }

            $document[0].cookie = cookieString;
        }

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
