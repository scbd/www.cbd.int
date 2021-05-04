import _ from 'lodash'
import app from '~/app'
import ng from 'angular'
import 'angular-vue'
import PageHeaderFixed from '~/components/page-header-fixed/index.vue';
import PageHeader      from '~/components/page-header/index.vue';
import PageFooter      from '~/components/page-footer/index.vue';
import toastTemplate from './toast.html'
import * as meta from '~/services/meta'
import 'css!cdn!npm/angular-toastr@1.3.0/dist/angular-toastr.css'
import '~/providers/realm'
import './directives/bread-crumbs'
              

    app.controller('TemplateController', ['$rootScope', '$window', 'authentication', '$q','toastr','$templateCache', '$location', '$scope',
                                  function($rootScope,   $window, authentication, $q,  toastr,  $templateCache,   $location, $scope) {

        $scope.headerOptions = { accountsUrl:   authentication.accountsBaseUrl(), signOut }                      
        $scope.user          = { userID: 1, name: 'anonymous', email: 'anonymous@domain', government: null, userGroups: null, isAuthenticated: false, isOffline: true, roles: [] }

        this.vueOptions  = {
          components: { PageHeaderFixed, PageHeader, PageFooter },
          i18n: new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { en: {} } })
        };

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
            $window.ga('set',  'page', basePath+$location.path());
            $window.ga('send', 'pageview');
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
                $window.location.href = '/';
            });
        }

        //=====================
        //
        //=====================
        function initUser() {
            $q.when(authentication.getUser()).then(function(user){

                $rootScope.user = user;
                $scope.user = user;
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
