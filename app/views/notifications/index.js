define(['app', 'lodash','services/article-service','filters/lstring'], function(app, _) { 'use strict';

    return ['$scope', '$route','$http', '$q','$sce', 'articleService', function ($scope, $route, $http, $q, $sce, articleService) {

        var code    = $route.current.params.code;
        var _ctrl   = $scope.notifCtrl = this;

        var matches = code.match(/^\d{4}-\d{3}$/);

        if(matches){
            loadNotification(code)
            loadArticle(code);
            // loadSubmissions(code);
        }
        

        //===========================
        //
        //===========================
        function loadNotification (code) {
            
            var result = { code : code };

            var options = {
                cache   : true,
                params  : {
                    q   : "schema_s: notification AND symbol_s: "+solrEscape(code),
                    fl  : "id, symbol_s,reference_s,title_t,date_dt,url_ss,actionDate_dt,recipient_ss",
                    rows: 1
                }
            };

            result = $http.get("/api/v2013/index", options).then(function(res){

                var results = _.map(res.data.response.docs, function(n) {
                    return _.defaults(n, {
                        _id       : n.id,
                        symbol    : n.reference_s || n.symbol_s,
                        number    : n.symbol_s,
                        date      : n.date_dt,
                        type      : 'notification',
                        actionDate: n.actionDate_dt,
                        recipients: n.recipient_ss.join(', '),
                        status    : 'public',
                        title     : { en: n.title_t },
                        files     : urlToFiles(n.url_ss)
                    });
                });

                return results.length ? results[0] : null;
            });

            $q.when(result).then(function(n){
                _ctrl.notification = n;
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

        //========================================
        //
        //
        //========================================        
        $scope.trustedHtml = function (plainText) {
            return $sce.trustAsHtml(plainText);
        }
        
        //===========================
        //
        //===========================
        function loadArticle(code){

            var query= [
                            {"$match"   : {'title.en': "UNDP-GEF ABS around the world"}},//{ "tags" : code } },
                            {"$sort"    : { "meta.updatedOn":-1}},
                            {"$project" : { title:1, content:1}},
                            {"$limit"   : 1 }
                        ];

            $q.when(articleService.query({ "ag" : JSON.stringify(query) }))
            .then(function(article){
                if(article.length > 0 )
                    _ctrl.article = article[0];
            });
        }

        //===========================
        //
        //===========================
        function loadSubmissions (code) {
            
            var result = { code : code };

            var options = {
                cache   : true,
                params  : {
                    q   : "schema_s: submission AND notification_ss: "+solrEscape(code),
                    fl  : "id,title_t,submittedDate_dt,referenceRecord_info_ss,file_ss",
                    rows: 500
                }
            };

            result = $http.get("/api/v2013/index", options).then(function(res){

                var results = _.map(res.data.response.docs, function(s) {
                    return _.defaults(s, {
                        _id       : s.id,
                        date      : s.submittedDate_dt,
                        type      : 'notification',
                        status    : 'public',
                        title     : { en: s.title_t },
                    });
                });

                return results.length ? results : null;
            });

            $q.when(result).then(function(s){
                _ctrl.submissions = s;
            });
        }        

    }];
});
