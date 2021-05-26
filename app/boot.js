export const cdnUrl   = 'https://cdn.jsdelivr.net/';
export const baseLibs = [
    'npm/angular@1.8.2/angular.min.js',
    'gh/scbd/angular-flex@2.2.2/angular-flex.min.js',
    'npm/angular-route@1.8.2/angular-route.min.js',
    'npm/angular-cookies@1.8.2/angular-cookies.min.js',
    'npm/angular-animate@1.8.2/angular-animate.min.js',
    'npm/angular-sanitize@1.8.2/angular-sanitize.min.js',
    'npm/lodash@3.10.1/index.min.js',
    'npm/moment@2.29.1/min/moment.min.js',
    'npm/moment-timezone@0.5.33/builds/moment-timezone-with-data-2012-2022.min.js',
    'npm/vue@2.6.12/dist/vue.min.js',
];

export default function bootApp(window, require, defineX) {

  const { document, location } = window;
  const basePathPattern        = /\/([-a-z0-9]*)($|\/.*|\?.*)/i;
  const basePath               = location.pathname.replace(basePathPattern, '$1');
  const gitVersion             = (document && document.documentElement.attributes['git-version'].value);

  defineX('cdn', { // cdn Plugin
    load: function (name, req, onload, config) {
      req([`${cdnUrl}${name}`], onload);
    }
  });

  require.config({
      waitSeconds: 30,
      baseUrl : '/app/',
      paths: {
          'css'               : `${cdnUrl}npm/require-css@0.1.10/css.min`,
          'ngDialog'          : `${cdnUrl}npm/ng-dialog@0.6.1/js/ngDialog.min`,
          'dragula'           : `${cdnUrl}npm/dragula@3.7.3/dist/dragula.min`,
          'rangy'             : `${cdnUrl}npm/rangy@1.3.0/lib/rangy-core.min`,
          'magnific-popup'    : `${cdnUrl}npm/magnific-popup@1.1.0/dist/jquery.magnific-popup.min`,
          'alasql'            : `${cdnUrl}npm/alasql@1.7.2/dist/alasql.min`,
          'tableexport'       : `${cdnUrl}npm/tableexport@4.0.10/dist/js/tableexport`,
          'blobjs'            : `${cdnUrl}npm/blobjs@1.1.1/Blob.min`,
          'file-saverjs'      : `${cdnUrl}npm/file-saverjs@1.3.6/FileSaver.min`,
          'linqjs'            : `${cdnUrl}npm/linq@3.2.3/linq.min`,
          'ngInfiniteScroll'  : `${cdnUrl}npm/ng-infinite-scroll@1.3.0/build/ng-infinite-scroll.min`,
          'ngSmoothScroll'    : `${cdnUrl}npm/ngSmoothScroll@2.0.0/dist/angular-smooth-scroll.min`,
          'datepicker'        : `${cdnUrl}npm/bootstrap-datepicker@1.4.0/js/bootstrap-datepicker.min`,
          'toastr'            : `${cdnUrl}npm/angular-toastr@1.7.0/dist/angular-toastr.min`,
          'ngVue'             : `${cdnUrl}npm/ngVue@1.7.7/build/index.min`,
          'angular-vue'       : `${cdnUrl}npm/@scbd/angular-vue@2.0.0/dist/angular-vue.min`,
          'conferenceCal'     : `${cdnUrl}npm/@scbd/conference-cal@0.1.2/dist/lib/ConferenceCal.umd.min`,
          'angular-cache'     : `${cdnUrl}npm/angular-cache@4.6.0/dist/angular-cache.min`,
          'PageHeaderFixed'   : `${cdnUrl}npm/@scbd/page-header-fixed/dist/PageHeaderFixed.umd.min`,
          'PageHeader'        : `${cdnUrl}npm/@scbd/page-header@0.0.70/dist/PageHeader.umd.min`,
          'PageFooter'        : `${cdnUrl}npm/@scbd/page-footer/dist/PageFooter.umd.min`,
          'nlp'               : `${cdnUrl}npm/compromise/builds/compromise.min`,
          'luxon'             : `${cdnUrl}npm/luxon@1.25.0/build/amd/luxon`,
          'axios'             : `${cdnUrl}npm/axios@0.21.1/dist/axios.min`,
          'vue-multiselect'   : `${cdnUrl}npm/vue-multiselect@2.1.6/dist/vue-multiselect.min`,
          'vue-i18n'          : `${cdnUrl}npm/vue-i18n@8.21.1/dist/vue-i18n.min`,
          'facebook'          : '//connect.facebook.net/en_US/sdk',
          'gmapsapi'          : 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCyD6f0w00dLyl1iU39Pd9MpVVMOtfEuNI&libraries=places',
          'bigText'           : `${cdnUrl}npm/bigtext@1.0.1/dist/bigtext`,
          'html2canvas'       :  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min',
          'angular-grid'      : `${cdnUrl}npm/angulargrid@0.6.5/angulargrid.min`,
          'mark'              : `${cdnUrl}npm/mark.js@8.11.1/dist/mark.min`,
          'ckeditor5'         : `${cdnUrl}npm/@ckeditor/ckeditor5-build-classic@27.1.0/build/ckeditor.min`,
          'vue-ckeditor5'     : `${cdnUrl}npm/@ckeditor/ckeditor5-vue2@1.0.5/dist/ckeditor.min`,
          'vue-tippy'         : `${cdnUrl}npm/vue-tippy@4.10.0/dist/vue-tippy.umd`
      },
      shim: {
          'ngDialog'             : { deps : ['angular', `css!${cdnUrl}combine/npm/ng-dialog@0.6.1/css/ngDialog.min.css,npm/ng-dialog@0.6.1/css/ngDialog-theme-default.min.css`] },
          'moment-timezone'      : { deps : ['moment'] },
          'interface'            : { deps : []},
          'magnific-popup'       : { deps : ['jquery', `css!${cdnUrl}npm/magnific-popup@1.1.0/dist/magnific-popup.css` ]},
          'dragula'              : { deps : [`css!${cdnUrl}npm/dragula@3.7.3/dist/dragula.min.css`]},
          'alasql'               : { deps : ['xlsx']},
          'gmapsapi'             : { exports: 'google'},
          'facebook'             : { exports: 'FB'},
          'ngVue'                : { deps : ['vue'] },
          'conferenceCal'        : { deps : ['ngVue',`css!${cdnUrl}npm/@scbd/conference-cal@0.1.2/dist/lib/ConferenceCal.css`] },
          'angular-cache'        : { deps : ['angular'] },
          'PageHeaderFixed'      : { deps : ['ngVue'] },
          'PageFooter'           : { deps : ['ngVue'] },
          'PageHeader'           : { deps : ['ngVue'] },
          'vue-multiselect'      : { deps : [`css!${cdnUrl}npm/vue-multiselect@2.1.6/dist/vue-multiselect.min.css`] },
          'ammap/themes/light'   : { deps : ['ammap'] },
          'amchart/themes/light' : { deps : ['amchart'] },
          'amchart/pie'          : { deps : ['amchart'] },
          'angular-grid'         : { deps : ['angular'] },
          'vue-ckeditor5'        : { deps : ['ckeditor5'] },
      },
      packages: [
          { name: 'amchart', main: 'amcharts.min', location : cdnUrl+'npm/amcharts3@3.21.15/amcharts' },
          { name: 'ammap'  , main: 'ammap.min'   , location : cdnUrl+'npm/ammap3@3.21.15/ammap' }
      ],
      urlArgs: function(id, url) {

        const hasHash    = /-[a-f0-9]{8}/i.test(id);
        const isAbsolute = /^https?:/.test(url);

        if(isAbsolute) return '';
        if(hasHash   ) return '';

        return 'v=' + gitVersion;
      }
  });

  defineX('jquery',  [],         ()=>window.$);
  defineX('lodash',  [],         ()=>window._);
  defineX('angular', [],         ()=>window.angular);
  defineX('moment',  [],         ()=>window.moment);
  defineX('moment-timezone', [], ()=>window.moment);
  defineX('vue',     ['vue-i18n', 'cdn!npm/@scbd/sso-vue-plugin-scbd@0.0.1/dist/sso-vue-plugin-scbd.umd.min.js'],  (i18n, ssoSCBD)=>{
      window.VueI18n = i18n;
      window.ssoSCBD = ssoSCBD;
      window.Vue.use(window.VueI18n);
      window.Vue.use(window.ssoSCBD);
      return window.Vue;
  });
  defineX('Vue', ['vue'], function(vue) { return vue; })

  defineX('xlsx', ['cdn!npm/xlsx@0.13.4/dist/xlsx.min.js', 'cdn!npm/xlsx@0.13.4/dist/jszip.js'], function (xlsx, jszip) {
      window.XLSX  = xlsx;
      window.JSZip = jszip;
      return xlsx;
  });

  defineX('dropbox-dropins', ['https://www.dropbox.com/static/api/2/dropins.js'], function(){
      if(window.Dropbox)
          window.Dropbox.appKey = "uvo7kuhmckw68pl"; //registration@cbd.int
      return window.Dropbox;
  });


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
