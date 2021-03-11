import 'moment'
import '~/filters/lstring'
import '~/directives/meetings/documents/document-files'
import _ from 'lodash'
import app from '~/app'
import template from './notification.html'

	app.directive('decisionNotification', ['$http', '$q', function($http, $q) {
		return {
			restrict : "E",
			template : template,
            replace: true,
			scope: {
                symbol:"<",
            },
			link: function ($scope) {

                lookupNotification();

                //===========================
                //
                //===========================
                function lookupNotification() {

                    var code = $scope.symbol;

                    var result = { symbol : code };

                    var options = {
                        cache : true,
                        params : {
                            q : "schema_s:notification AND symbol_s:"+solrEscape(code),
                            fl : "id, symbol_s,reference_s,title_t,date_dt,url_ss",
                            rows: 1
                        }
                     };

                    result = $http.get("/api/v2013/index", options).then(function(res){

                        var results = _.map(res.data.response.docs, function(n) {
                            return _.defaults(n, {
                                _id: n.id,
                                symbol: n.reference_s || n.symbol_s,
                                number: n.symbol_s,
                                date:   n.date_dt,
                                type:  'notification',
                                status : 'public',
                                title : { en : n.title_t },
                                files : urlToFiles(n.url_ss)
                            });
                        });

                        return results.length ? results[0] : null;
                    });


                    $q.when(result).then(function(n){
                        $scope.notification = n;
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

            }
        };
    }]);
