define(['app', 'angular', 'lodash','services/article-service','filters/lstring', 'directives/meetings/documents/document-files'], function(app, angular, _) { 'use strict';

    return ['$scope', '$route','$http', '$q','$sce', 'articleService', function ($scope, $route, $http, $q, $sce, articleService) {

        var code   = $route.current.params.symbol;
        var _ctrl  = $scope.notifCtrl = this;

        _ctrl.onArticleLoad = onArticleLoad;


        loadNotification(code);


        //===========================
        //
        //===========================
        function loadNotification (code) {
            
            var result = { code : code };

            var options = {
                cache   : true,
                params  : {
                    q   : "schema_s: notification AND symbol_s: "+solrEscape(code),
                    fl  : "_id:id, symbol:symbol_s,reference:reference_s,title_t,date:date_dt,url_ss,actionDate:actionDate_dt,recipients:recipient_ss",
                    rows: 1
                }
            };

            result = $http.get("/api/v2013/index", options).then(function(res){

                var results = _.map(res.data.response.docs, function(n) {
                    return _.defaults(n, {
                        type      : 'notification',
                        title     : { en: n.title_t },
                        files     : urlToFiles(n.url_ss)
                    });
                });

                return results.length ? results[0] : null;

            }).then(function(n) {

                 _ctrl.notification = n;

                 loadSubmissions(n._id);
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
                    url : 'http://localhost:2000'+url
                };
            });
        }

        //========================================
        //
        //
        //========================================
        function solrEscape(value) {

            if(value===undefined) throw "Value is undefined";
            if(value===null)      throw "Value is null";
            if(value==="")        throw "Value is null";

            if(_.isNumber(value)) value = value.toString();
            if(_.isDate  (value)) value = value.toISOString();

            //TODO add more types

            value = value.toString();

            value = value.replace(/\\/g,   '\\\\');
            value = value.replace(/\+/g,   '\\+');
            value = value.replace(/\-/g,   '\\-');
            value = value.replace(/\&\&/g, '\\&&');
            value = value.replace(/\|\|/g, '\\||');
            value = value.replace(/\!/g,   '\\!');
            value = value.replace(/\(/g,   '\\(');
            value = value.replace(/\)/g,   '\\)');
            value = value.replace(/\{/g,   '\\{');
            value = value.replace(/\}/g,   '\\}');
            value = value.replace(/\[/g,   '\\[');
            value = value.replace(/\]/g,   '\\]');
            value = value.replace(/\^/g,   '\\^');
            value = value.replace(/\"/g,   '\\"');
            value = value.replace(/\~/g,   '\\~');
            value = value.replace(/\*/g,   '\\*');
            value = value.replace(/\?/g,   '\\?');
            value = value.replace(/\:/g,   '\\:');

            return value;
        }

        //===========================
        //
        //===========================
        function loadSubmissions(id) {

            var result = { id : id };

            var options = {
                cache   : true,
                params  : {
                    q   : "schema_s: submission AND referenceRecord_ss: "+solrEscape(id),
                    fl  : "_id:id,title_t,submittedDate:submittedDate_dt,referenceRecord_info_ss,url_ss,files_ss",
                    sort: "submittedDate_dt asc",
                    rows: 500
                }
            };

            result = $http.get("/api/v2013/index", options).then(function(res){

                var results = _.map(res.data.response.docs, function(s) {
                    return _.defaults(s, {
                        title           : { en: s.title_t },
                        files           : _.map(s.files_ss, function(f){ return JSON.parse(f); }),
                        isOrganization  : !_.isEmpty(_.filter(_.map(s.referenceRecord_info_ss, function(f){ return JSON.parse(f); }), { field: 'organization'})),
                        countryOrOrganization : "org or country",
                    });
                });

                return results.length ? results : null;
            });

            $q.when(result).then(function(s){
                _ctrl.submissions = s;
            });
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

            _ctrl.article = article;

            if(!article) {
                _ctrl.embed = _.findWhere(_ctrl.notification.files, { type : 'application/pdf', language: 'en' });
            }
        }
    }];
});
