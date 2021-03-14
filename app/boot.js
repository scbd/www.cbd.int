export const baseLibs = [
    'npm/angular@1.8.2/angular.min.js',
    'gh/scbd/angular-flex@2.2.2/angular-flex.min.js',
    'npm/angular-route@1.8.2/angular-route.min.js',
    'npm/angular-cookies@1.8.2/angular-cookies.min.js',
    'npm/angular-animate@1.8.2/angular-animate.min.js',
    'npm/angular-sanitize@1.8.2/angular-sanitize.min.js',
    'npm/lodash@3.10.1/index.min.js',
    'npm/vue@2.6.12/dist/vue.min.js',
];

export default function bootApp(window, require, defineX) {

const basePathPattern = /\/([-a-z0-9]*)($|\/.*|\?.*)/i;

const { document, location } = window;

const basePath   = location.pathname.replace(basePathPattern, '$1');
const gitVersion = (document && document.documentElement.attributes['git-version'].value);
const cdnHost    = (document && document.documentElement.attributes['cdn-url'    ].value) || 'https://cdn.jsdelivr.net/';

require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'ngDialog'        : cdnHost + 'npm/ng-dialog@0.6.1/js/ngDialog.min',
        'css'             : cdnHost + 'npm/require-css@0.1.10/css.min',
        'dragula'         : cdnHost + 'npm/dragula@3.7.3/dist/dragula.min',
        'moment'          : cdnHost + 'npm/moment@2.22.2/min/moment.min',
        'moment-timezone' : cdnHost + 'npm/moment-timezone@0.5.21/builds/moment-timezone-with-data-2012-2022.min',
        'rangy'           : cdnHost + 'npm/rangy@1.3.0/lib/rangy-core.min.js',
        'shim'            : cdnHost + 'gh/zetlen/require-shim/src/shim',
        'interface'       : 'js/interface',
        'magnific-popup'  : cdnHost + 'npm/magnific-popup@1.1.0/dist/jquery.magnific-popup.min',
        'ammap3WorldHigh' : 'directives/reporting-display/worldEUHigh',
        'alasql'          : 'libs/alasql/dist/alasql.min',
        'js-xlsx'         : 'libs/js-xlsx/dist/xlsx.min',
        'js-zip'          : 'libs/js-xlsx/dist/jszip',
        'ods'             : 'libs/js-xlsx/dist/ods',
        'tableexport'     : cdnHost + 'npm/tableexport@4.0.10/dist/js/tableexport',
        'blobjs'          : cdnHost + 'npm/blobjs@1.1.1/Blob.min',
        'file-saverjs'    : cdnHost + 'npm/file-saverjs@1.3.6/FileSaver.min',
        'xlsx'            : cdnHost + 'npm/xlsx@0.13.4/dist/xlsx',
        'jszip'           : cdnHost + 'npm/xlsx@0.13.4/dist/jszip',  
        'linqjs'          : 'libs/linqjs/linq',
        'ngInfiniteScroll': 'libs/ngInfiniteScroll/build/ng-infinite-scroll',
        'ngSmoothScroll'  : cdnHost + 'npm/ngSmoothScroll@2.0.0/dist/angular-smooth-scroll.min',
        'bootstrap-datepicker': cdnHost +'npm/bootstrap-datepicker@1.4.0/js/bootstrap-datepicker.min',
        'toastr'          : cdnHost + 'npm/angular-toastr@1.7.0/dist/angular-toastr.min',
        'ammap3'          : 'libs/ammap3/ammap/ammap',
        'ammap-theme'     : 'libs/ammap3/ammap/themes/light',
        'ngMeta'          : 'libs/ngMeta/dist/ngMeta.min',
        'facebook'        : '//connect.facebook.net/en_US/sdk',
        'gmapsapi'        : 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCyD6f0w00dLyl1iU39Pd9MpVVMOtfEuNI&libraries=places',
        'ngVue'           : cdnHost + 'npm/ngVue@1.7.7/build/index.min',
        'angular-vue'     : cdnHost + 'npm/@scbd/angular-vue@2.0.0/dist/angular-vue.min',
        'conferenceCal'   : cdnHost + 'npm/@scbd/conference-cal@0.1.2/dist/lib/ConferenceCal.umd.min',
        'angular-cache'   : cdnHost + 'npm/angular-cache@4.6.0/dist/angular-cache.min',
        'PageHeaderFixed' : cdnHost + 'npm/@scbd/page-header-fixed/dist/PageHeaderFixed.umd.min',
        'PageHeader'      : cdnHost + 'npm/@scbd/page-header@0.0.70/dist/PageHeader.umd.min',
        'PageFooter'      : cdnHost + 'npm/@scbd/page-footer/dist/PageFooter.umd.min',
        'nlp'             : cdnHost + 'npm/compromise/builds/compromise.min',
        'luxon'           : cdnHost + 'npm/luxon@1.25.0/build/amd/luxon',
        'axios'           : cdnHost + 'npm/axios@0.21.1/dist/axios.min',
        'vue-multiselect' : cdnHost + 'npm/vue-multiselect@2.1.6/dist/vue-multiselect.min',
        'vue-i18n'        : cdnHost + 'npm/vue-i18n@8.21.1/dist/vue-i18n.min',
        
    },
    shim: {
        'ngDialog'             : { deps : ['angular', `css!${cdnHost}combine/npm/ng-dialog@0.6.1/css/ngDialog.min.css,npm/ng-dialog@0.6.1/css/ngDialog-theme-default.min.css`] },
        'bootstrap-notify'     : { deps : ['jquery'] },
        'moment-timezone'      : { deps : ['moment'] },
        'interface'            : { deps : []},
        'magnific-popup'       : { deps : ['jquery', `css!${cdnHost}npm/magnific-popup@1.1.0/dist/magnific-popup.css` ]},
        'dragula'              : { deps : ['css!libs/dragula.js/dist/dragula.css']},
        'alasql'               : { deps : ['js-xlsx']},
        'js-xlsx'              : { deps : ['js-zip', 'ods']},
        'toastr'               : { deps : ['angular'] },
        'ngSmoothScroll'       : { deps : ['angular'] },
        'ngInfiniteScroll'     : { deps : ['angular'] },
        'gmapsapi'             : { exports: 'google'},
        'facebook'             : { exports: 'FB'},
        'ngVue'                : { deps : ['vue'] },
        'conferenceCal'        : { deps : ['ngVue',`css!${cdnHost}npm/@scbd/conference-cal@0.1.2/dist/lib/ConferenceCal.css`] },
        'angular-cache'        : { deps : ['angular'] },
        'PageHeaderFixed'      : { deps : ['ngVue'] },
        'PageFooter'           : { deps : ['ngVue'] },
        'PageHeader'           : { deps : ['ngVue'] },
        'xlsx'                 : { deps : ['jszip'],'exports': 'XLSX'},
        'vue-multiselect'      : { deps : [`css!${cdnHost}npm/vue-multiselect@2.1.6/dist/vue-multiselect.min.css`] },
    },
    packages: [
        { name: 'amchart', main: 'amcharts', location : 'libs/amcharts3/amcharts/' },
        { name: 'ammap'  , main: 'ammap'   , location : 'libs/ammap3/ammap' }
    ],
});

defineX('jquery',       [],  ()=>window.$);
defineX('lodash',       [],  ()=>window._);
defineX('angular',      [],  ()=>window.angular);
defineX('ngRoute',      ['angular'], (ng)=>{ console.log('Base lib. not need import: ngRoute');       return ng});
defineX('ngCookies',    ['angular'], (ng)=>{ console.log('Base lib. not need import: ngCookies');     return ng});
defineX('ngAnimate',    ['angular'], (ng)=>{ console.log('Base lib. not need import: ngAnimate');     return ng});
defineX('ngSanitize',   ['angular'], (ng)=>{ console.log('Base lib. not need import: ngSanitize');    return ng});
defineX('angular-flex', ['angular'], (ng)=>{ console.log('Base lib. not need import:  angular-flex'); return ng});
defineX('vue',          ['vue-i18n', 'https://cdn.cbd.int/@scbd/sso-vue-plugin-scbd@0.0.1'],  (i18n, ssoSCBD)=>{
    window.VueI18n = i18n;
    window.ssoSCBD = ssoSCBD;
    window.Vue.use(window.VueI18n);
    window.Vue.use(window.ssoSCBD);
    return window.Vue;
});
defineX('Vue', ['vue'], function(vue) { return vue; })

defineX ('popper.js', [ cdnHost + 'popper.js@1.16.0/dist/umd/popper.min'], function(popper){
  window.Popper = popper
  return popper
})

defineX('cdn', {
    load: function (name, req, onload, config) {
        req([cdnHost + name], onload);
    }
});

defineX('xlsx', ['js-zip', 'ods'], function (jszip, ods) {
    window.JSZip = jszip;
    window.ODS   = ods;
});

defineX('underscore', ['lodash'], function(_) { console.log('Deprecated: use lodash'); return _; });

defineX('dropbox-dropins', ['https://www.dropbox.com/static/api/2/dropins.js'], function(){
    if(window.Dropbox)
        window.Dropbox.appKey = "uvo7kuhmckw68pl"; //registration@cbd.int
    return window.Dropbox;
});

defineX('jquery', function(){ if(window.jQuery) { return window.jQuery; }});

  if(document) { // BOOT App
    const deps = [
      import('angular'),
      import('~/app'),
      import('~/template'),
      import(`./routes/${basePath}.js`).then(()=>{ $("base").attr('href', `/${basePath}/`) }),// set route base-path to allow full page reload outside of  /basePath/*
    ];

    Promise.all(deps).then(([ng, { default: app }]) => {
      ng.element(document).ready(function () {
        ng.bootstrap(document, [app.name]);
      });
    }).catch((e)=>{ console.error('Error bootstrapping the app:', e) });
  } 
}
