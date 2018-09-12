define(['app', 'angular','text!./toast.html', 'text!./template-header.html', 'text!./template-footer.html',
'lodash', 'providers/realm'], function(app, ng, toastTemplate,headerHtml, footerHtml,_) {
    'use strict';

    app.controller('TemplateController', ['$rootScope', '$location', '$window', function($rootScope, $location, $window) {

        var basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');

        ng.element($window).on('resize', updateSize);

        $rootScope.$on('$routeChangeSuccess', function(){
            $window.ga('set',  'page', basePath+$location.path());
            $window.ga('send', 'pageview');
        });

        function updateSize() {
            $rootScope.$applyAsync(function(){
                $rootScope.deviceSize = $('.device-size:visible').attr('size');
            });
        }      

        updateSize();
    }]);

    app.directive('templateHeader', ['$rootScope', '$window', '$browser', '$document', 'authentication', '$q','toastr','$templateCache', 
                             function($rootScope,   $window,   $browser,   $document,   authentication,   $q,toastr,$templateCache) {
        return {
            restrict: 'E',
            template: headerHtml,
            link: function($scope) {

                $templateCache.put("directives/toast/toast.html", toastTemplate);
          
                $q.when(authentication.getUser()).then(function(user){

                    $scope.user = user;

                    require(["js/slaask"], function(_slaask) {

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
                        }
                    });                    
                });

                $scope.$on('signOut', function(){
                    $window.location.href = '/';
                });

                $scope.$on('signIn', function(){
                    $scope.signIn();
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
