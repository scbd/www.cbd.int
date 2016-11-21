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

                if(!name || name=='session')    selected = selected || /\/meetings\/[a-z0-9\-]+\/agenda/i.test(path);
                if(!name || name=='schedules')  selected = selected || path.indexOf('/schedules')===0;
                if(!name || name=='COP-13')     selected = selected || path.indexOf('/meetings/COP-13/documents'   )===0;
                if(!name || name=='MOP-08')     selected = selected || path.indexOf('/meetings/MOP-08/documents'   )===0;
                if(!name || name=='NP-MOP-02')  selected = selected || path.indexOf('/meetings/NP-MOP-02/documents')===0;

                return selected;
            },

            goto : function(target) {

                $scope.meetingNavCtrl.currentSelection = target;

                if(target=='session')     return navigate("/meetings/COP-13/agenda");
                if(target=='COP-13')      return navigate("/meetings/COP-13/documents#"+$location.hash());
                if(target=='MOP-08')      return navigate("/meetings/MOP-08/documents#"+$location.hash());
                if(target=='NP-MOP-02')   return navigate("/meetings/NP-MOP-02/documents#"+$location.hash());
                if(target=='schedules')   return navigate("/schedules/2677703125163603?datetime=2016-12-05T06:01:00");
                if(target=='side-events') return navigate('https://www.cbd.int/side-events');
                if(target=='COP-HOME')    return navigate('https://www.cbd.int/cop2016');

                navigate(target);
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
