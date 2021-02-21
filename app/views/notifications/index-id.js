import _    from 'lodash'
import solr from 'util/solr'
import 'app'
import 'services/article-service'
import 'directives/meetings/documents/document-files'
import '../../filters/lstring'
import '../../filters/term'


    var MIMES = {
        'application/pdf':                                                            { priority: 10,  color: 'red',    btn: 'btn-danger',  icon: 'fa-file-pdf-o'   },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { priority: 20,  color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/msword':                                                         { priority: 30,  color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { priority: 40,  color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.ms-excel':                                                   { priority: 50,  color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { priority: 60,  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/vnd.ms-powerpoint':                                              { priority: 70,  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
        'application/zip':                                                            { priority: 80,  color: '',       btn: 'btn-default', icon: 'fa-file-archive-o' },
        'text/html':                                                                  { priority: 80,  color: '',       btn: 'btn-default', icon: 'fa-link' },
        'default':                                                                    { priority:999,  color: 'orange', btn: 'btn-default', icon: 'fa-file-o' }
    };
    export default ['$scope', '$route','$http', '$q','$sce', 'articleService', function ($scope, $route, $http, $q, $sce, articleService) {

        var code   = $route.current.params.symbol;
        var _ctrl  = $scope.notifCtrl = this;

        _ctrl.onArticleLoad  = onArticleLoad;

        $scope.MIMES = MIMES;

        loadCountries();
        loadNotification(code);

        //===========================
        //
        //===========================
        function loadNotification (code) {
            
            var result = { code : code };

            var options = {
                cache   : true,
                params  : {
                    q   : "schema_s: notification AND symbol_s: "+solr.escape(code),
                    fl  : "_id:id, symbol:symbol_s, reference:reference_s, title_t, date:date_dt,url_ss, actionDate:actionDate_dt, recipients:recipient_ss, thematicAreas:thematicAreas_EN_txt",
                    rows: 1
                }
            };

            return $http.get("/api/v2013/index", options).then(function(res){

                var results = _.map(res.data.response.docs, function(n) {
                    return _.defaults(n, {
                        title     : { en: n.title_t },
                        files     : urlToFiles(n.url_ss)
                    });
                });

                return results.length ? results[0] : null;

            }).then(function(n) {

                 _ctrl.notification = n;

                 loadSubmissions(code);
                 loadArticle(code);
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
                    q   : "schema_s: submission AND notifications_ss: "+solr.escape(id),
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
        function loadArticle(code){
            
            var match = { "adminTags.title.en" : { $all: ['notification', code]}};     

            _ctrl.articleQuery = [
                {"$match"   : match },
                {"$sort"    : { "meta.updatedOn":-1}},
                {"$limit"   : 1 }
            ];
        }

        //===========================
        //
        //===========================
        function onArticleLoad(article) {

            var embed = null;

            embed = embed || _.findWhere(_ctrl.notification.files, { type : 'application/pdf', language: 'en' });
            embed = embed || _.findWhere(_ctrl.notification.files, { type : 'application/pdf', language: 'es' });
            embed = embed || _.findWhere(_ctrl.notification.files, { type : 'application/pdf', language: 'fr' });
            
            _ctrl.preview = { type: "none" };

                 if(article) _ctrl.preview = { type: "article",  article: article   };
            else if(embed)   _ctrl.preview = { type: "embed",    url:     embed.url };
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

