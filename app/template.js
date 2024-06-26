import _ from 'lodash'
import app from '~/app'
import ng from 'angular'
// import PageHeaderFixedComp from 'PageHeaderFixed'
import PageHeaderComp from 'PageHeader'
import PageFooterComp from 'PageFooter'
import toastTemplate from './toast.html'
import * as meta from '~/services/meta'
import 'css!cdn!npm/angular-toastr@1.3.0/dist/angular-toastr.css'
import 'ngVue'
import '~/providers/realm'
import '~/services/translation-service'
import './directives/bread-crumbs'
import ScbdHeader from '~/components/nav/heade.vue'
import ScbdFooter from '~/components/nav/footer.vue'
              
    loadHeaderFooter()
    app.controller('TemplateController', ['$rootScope', '$window', '$browser', '$document', 'authentication', '$q','toastr','$templateCache', '$location','locale', 
                                  function($rootScope,   $window,   $browser,   $document,   authentication,   $q,  toastr,  $templateCache,   $location, locale) {


        $templateCache.put("directives/toast/toast.html", toastTemplate);

        if(!window.$ && window.jQuery) window.$ = window.jQuery;

        var basePath  = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');

        // exports: 
        this.dir = locale === 'ar' ? 'rtl' : 'ltr';
        this.viewOnly = $rootScope.viewOnly = !!$location.search().viewOnly;

        this.getEncodedReturnUrl = function() { return encodeURIComponent(getReturnUrl()); };
        this.accountsUrl = authentication.accountsBaseUrl();
        this.signOut = signOut;

        initialize();

        //=====================
        //=====================
        //=====================

        $rootScope.$watch('page.title',       function(value) { meta.title(value) });
        $rootScope.$watch('page.description', function(value) { meta.description(value) });

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
            $window.gtag('event', 'page_view', {
                'page_location' : basePath+$location.path()
            });
        }

        //=====================
        //
        //=====================
        function updateSize() {

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
             //   $window.location.href = '/';
            });
        }

        //=====================
        //
        //=====================
        function initUser() {
            $q.when(authentication.getUser()).then(function(user){

                $rootScope.user = user;

                import("~/js/slaask").then(function({ default: _slaask }) {

                    if (user.isAuthenticated) {
                        _slaask.identify(user.name, {
                            'user-id' : user.userID,
                            'name' : user.name,
                            'email' : user.email,
                        });

                        if(_slaask.initialized && _slaask.slaaskSendUserInfos) {
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

    function loadHeaderFooter(){

        // var PageHeaderFixed  = window.Vue.component('page-header-fixed', PageHeaderFixedComp);
        // var PageHeader       = window.Vue.component('page-header',       PageHeaderComp);
        // var PageFooter          = window.Vue.component('page-footer',       PageFooterComp);
        // app.value('PageHeaderFixed', PageHeaderFixed );
        // app.value('PageHeader',      PageHeader);
        // app.value('PageFooter',      PageFooter);

        var ScbdHeaderComponent = window.Vue.component('scbd-header',       ScbdHeader);
        var ScbdFooterComponent = window.Vue.component('scbd-footer',       ScbdFooter);    
        app.value('ScbdHeader',      ScbdHeaderComponent);
        app.value('ScbdFooter',      ScbdFooterComponent);
    }
