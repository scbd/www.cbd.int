import _    from 'lodash'
import solr from '~/util/solr'
import '~/app'
import '~/directives/articles/cbd-article'
import '~/directives/meetings/documents/document-files'
import '~/filters/lstring'
import '~/filters/term'
import '~/filters/moment'
import ArticlesApi from '~/api/articles'
import jumpTo from '~/services/jump-to-anchor'
import { textToHtml } from '~/util/html'
import MIMES from '~/data/file-types'
import { getLanguageName } from '~/data/languages';

export { default as template } from './index-id.html'

export default ['$scope', '$route','$http', '$q','$sce', 'articleService', 'locale', function ($scope, $route, $http, $q, $sce, articleService, locale) {

        var code   = $route.current.params.symbol;
        var _ctrl  = $scope.notifCtrl = this;

        _ctrl.jumpTo = jumpTo;

        $scope.MIMES = MIMES;
        $scope.getLanguageName = getLanguageName;

        loadCountries();
        loadNotification(code);

        //===========================
        //
        //===========================
        async function loadNotification (code) {

            const LOCALE = locale.toUpperCase();
            const titleField = `title_${LOCALE}_t`;

            const options = {
                cache   : true,
                params  : {
                    q   : "schema_s: notification AND symbol_s: "+solr.escape(code),
                    fl  : `_id:id, symbol:symbol_s, reference:reference_s, title_t, ${titleField}, fulltext_t, from_t, date:date_dt,url_ss, files_ss, actionDate:actionDate_dt, recipients:recipient_ss, thematicAreas:thematicAreas_EN_txt`,
                    rows: 1
                }
            };

            const qArticle      = loadArticle(code);
            const qNotification = $http.get("/api/v2013/index", options).then(function(res){

                var results = _.map(res.data.response.docs, function(n) {
                    return _.defaults(n, {
                        title     : { en: n.title_t, [locale] : n[titleField] || n.title_t },
                        files     : JSON.parse(n.files_ss) // urlToFiles(n.url_ss)
                    });
                });

                return results.length ? results[0] : null;
            });
            
            const [ notification, article ] = await Promise.all([qNotification, qArticle])

            $scope.$apply(()=>{

                _ctrl.notification = notification;
                onArticleLoad(article);
                 
                loadSubmissions(code);
            });
        }

        //==============================
        //
        //==============================
        function urlToFiles(url_ss) {

            return _.map(url_ss||[], function(url){

                var mime;
                var locale;

                if(/\.pdf$/ .test(url)) mime = 'application/pdf';
                if(/\.doc$/ .test(url)) mime = 'application/msword';
                if(/\.docx$/.test(url)) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

                if(/-ar\.\w+$/ .test(url)) locale = 'ar';
                if(/-en\.\w+$/ .test(url)) locale = 'en';
                if(/-es\.\w+$/ .test(url)) locale = 'es';
                if(/-fr\.\w+$/ .test(url)) locale = 'fr';
                if(/-ru\.\w+$/ .test(url)) locale = 'ru';
                if(/-zh\.\w+$/ .test(url)) locale = 'zh';

                return {
                    type : mime,
                    language: locale,
                    url : 'https://www.cbd.int'+url
                };
            });
        }

        //===========================
        //
        //===========================
        function loadSubmissions(id) {

            var options = {
                cache   : true,
                params  : {
                    q   : "_state_s:public AND schema_s: submission AND notifications_ss: "+solr.escape(id),
                    fl  : "_id:id, government:government_s, title_t, submittedDate:date_dt, referenceRecord_info_ss, url_ss, files_ss",
                    sort: "date_dt asc, title_s asc",
                    rows: 500
                }
            };

            return $q.all([loadCountries(), $http.get("/api/v2013/index", options)]).then(function(res){ return res[1] }).then(function(res) {

                _ctrl.submissions = _.map(res.data.response.docs, function(s) {
                    return _.defaults(s, {
                        title           : { en: s.title_t },
                        files           : _.map(s.files_ss, parseFile_s),
                        submitterType   : getSubmitterType(s)
                    });
                });

                $scope.$applyAsync(()=>jumpTo());
            });
        }    

        //===========================
        //
        //===========================
        function parseFile_s(file_s){

            var file = JSON.parse(file_s);

            if(!file.type && /\.pdf$/ .test(file.url||'')) file.type = 'application/pdf';
            if(!file.type && /\.doc$/ .test(file.url||'')) file.type = 'application/msword';
            if(!file.type && /\.docx$/.test(file.url||'')) file.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            return file;
        }
        
        //===========================
        //
        //===========================
        async function loadArticle(code){
            
            const q = { "adminTags" : { $all: ['notification', kebabCase(code)]}};     
            const s = { "meta.updatedOn":-1 };
            const fo = 1;

            const api = new ArticlesApi();

            const article = await api.queryArticles({ q, s, fo });

            return article;
        }

        function kebabCase(val){
            return val.toLowerCase().replace(/\s/g, '-')
        }

        //===========================
        //
        //===========================
        function onArticleLoad(article) {

            var embed = null;

            embed = embed || _.findWhere(_ctrl.notification.files, { type : 'application/pdf', language: 'en' });
            embed = embed || _.findWhere(_ctrl.notification.files, { type : 'application/pdf', language: 'es' });
            embed = embed || _.findWhere(_ctrl.notification.files, { type : 'application/pdf', language: 'fr' });
            
            const hasFulltext = !!_ctrl?.notification?.fulltext_t;
            _ctrl.preview = { type: "none" };

                 if(article)     _ctrl.preview = { type: "article",  article: article   };
            else if(hasFulltext) _ctrl.preview = { type: "text",     html:    textToHtml(_ctrl?.notification?.fulltext_t, {preserveNewLine:false}) };
            else if(embed)       _ctrl.preview = { type: "embed",    url:     embed.url };
        }

        //========================
        //
        //========================
        var countries;

        function loadCountries() {

            if(countries)
                return $q.when(countries);

            return countries = $http.get('/api/v2015/countries', { cache:true, params: {f: {code:1, treaties:1}} }).then(function(res){

                return countries = _.reduce(res.data, function(countries, country){
                    countries[country.code] = country;
                    return countries;
                }, {});
            });
        }

        //========================
        //
        //========================
        function getSubmitterType(submission) {

            var country = countries[(submission.government||'').toUpperCase()];

            if(country &&  country.treaties.XXVII8.party) return 'party';     // TODO CP+NP
            if(country && !country.treaties.XXVII8.party) return 'non-party'; // TODO CP+NP
            
            return 'observer';
        }
    }];
