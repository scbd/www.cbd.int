import '~/filters/lstring'
import _   from 'lodash'
import app from 'app'
import template from './decision-reference.html'


	app.directive('decisionReference', ['$http', function($http) {
		return {
			restrict : "E",
			template : template,
            replace: true,
			scope: {
                symbol:"<",
            },
			link: function ($scope) {

                lookup($scope.symbol);


                //===========================
                //
                //===========================
                function lookup(code) {

                    if(!code)
                        return;

                    if(isUrl(code||'')) {
                        $scope.url = code;
                        return;
                    }

                    var elementCode = code.replace(/(\w+\/\w+\/\w+\/\w+)\/(.+)/, '$1.$2');

                    $http.get("/api/v2016/decision-texts", {
                        cache: true,
                        params: {
                            q:  { $or: [ { 'code' : code }, { 'elements.code' : elementCode } ]},
                            f:  { "code":1, "symbol":1, "treaty":1, "body":1, "session":1, "decision":1, "meeting":1, "title":1, "elements.code":1, "elements.section":1, "elements.paragraph":1, "elements.item":1, "elements.subitem":1, "elements.text":1 },
                            l:1
                        }
                    }).then(function(res){

                        if(!res.data || !res.data.length)
                            return;

                        var decision = res.data[0];
                        var url      = '/decisions/'+decision.body.toLowerCase()+'/'+decision.session+'/'+decision.decision;

                        decision.elements = _.filter(decision.elements||[], { code: elementCode });

                        if(decision.elements[0]) {
                            var el = decision.elements[0];
                            url += '/'+(el.section||'')+el.paragraph
                        }

                        $scope.url = url;
                        $scope.decision = decision;
                    });
                }

                //====================================
                //
                //====================================
                function isUrl(text) {
                    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i.test(text||'');
                }
            }
        };
    }]);