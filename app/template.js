define(['app', 'angular','text!./toast.html',
'lodash', 'PageHeaderFixed','PageHeader','PageFooter','ngVue','providers/realm','./directives/bread-crumbs'], function(app, ng, toastTemplate, _, PageHeaderFixedComp, PageHeaderComp, PageFooterComp) {
    'use strict';

    loadIfPhoenix()

    app.controller('TemplateController', ['$rootScope', '$window', '$browser', '$document', 'authentication', '$q','toastr','$templateCache', '$location', 
                                  function($rootScope,   $window,   $browser,   $document,   authentication,   $q,  toastr,  $templateCache,   $location) {

        $templateCache.put("directives/toast/toast.html", toastTemplate);

        if(!window.$ && window.jQuery) window.$ = window.jQuery;

        var basePath  = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');

        // exports: 

        this.viewOnly = $rootScope.viewOnly = !!$location.search().viewOnly;

        this.getEncodedReturnUrl = function() { return encodeURIComponent(getReturnUrl()); };
        this.accountsUrl = authentication.accountsBaseUrl();
        this.signOut = signOut;

        initialize();

        //=====================
        //=====================
        //=====================

        //=====================
        //
        //=====================
        function initialize() {


            //Register events

            ng.element($window).on('resize', _.debounce(updateSize, 50, { maxWait:100 }));
            $rootScope.$on('$routeChangeSuccess', updateAnalytics);

            $rootScope.$on('signIn',  signIn);
            $rootScope.$on('signOut', function() { $window.location.href = '/'; });
            
            $rootScope.$on("showInfo",    function(evt, msg) { toastr.info(msg);    });
            $rootScope.$on("showWarning", function(evt, msg) { toastr.warning(msg); });
            $rootScope.$on("showSuccess", function(evt, msg) { toastr.success(msg); });
            $rootScope.$on("showError",   function(evt, msg) { toastr.error(msg);   });

            // Init

            initUser();
            updateSize();
        }

        //=====================
        //
        //=====================
        function updateAnalytics() {
            $window.ga('set',  'page', basePath+$location.path());
            $window.ga('send', 'pageview');
        }

        //=====================
        //
        //=====================
        function updateSize() {

            if(!$rootScope.bootstrapVersion) $rootScope.bootstrapVersion = ng.element("body").hasClass("bootstrap4") ? 4 : 3;
            if(!$rootScope.templateVersion)  $rootScope.templateVersion  = ng.element("body").hasClass("phoenix") ? "phoenix" : "cbd";

            $rootScope.$applyAsync(function(){
                $rootScope.deviceSize = $('.device-size:visible').attr('size');
            });
        }

        //=====================
        //
        //=====================
        function getReturnUrl() {
            return $location.absUrl();
        }

        ////////////
        // Users 

        //=====================
        //
        //=====================
        function signIn() {
            $q.when(authentication.getUser()).then(function(user){
                
                if(user.isAuthenticated)
                    return;

                $window.location.href = authentication.accountsBaseUrl() + '/signin?returnUrl=' + encodeURIComponent(getReturnUrl());
            });
        }

        //=====================
        //
        //=====================
        function signOut() {
            $q.when(authentication.getUser()).then(function(user){
                
                if(!user.isAuthenticated)
                    return;
                
                authentication.signOut();
                $window.location.href = '/';
            });
        }

        //=====================
        //
        //=====================
        function initUser() {
            $q.when(authentication.getUser()).then(function(user){

                $rootScope.user = user;

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
                    }
                });                    
            });
        }

    }]);

    function loadIfPhoenix(){
        var phoenixElm =  document.getElementById("phoenix")

        if(!phoenixElm || phoenixElm.tagName !== 'BODY') return

        var PageHeaderFixed  = window.Vue.component('page-header-fixed', PageHeaderFixedComp);
        var PageHeader       = window.Vue.component('page-header',       PageHeaderComp);
        var PageFooter       = window.Vue.component('page-footer',       PageFooterComp);
    
        app.value('PageHeaderFixed', PageHeaderFixed );
        app.value('PageHeader',      PageHeader);
        app.value('PageFooter',      PageFooter);
    }
});
