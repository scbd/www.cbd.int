define(['app', 'text!./meeting-document.html', 'filters/lstring', 'directives/meetings/documents/document-files'], function(app, template) { 'use strict';

	return app.directive('decisionMeetingDocument', ['$http', '$q', function($http, $q) {
		return {
			restrict : "E",
			template : template,
            replace: true,
			scope: {
                symbol:"<",
            },
			link: function ($scope) {

                lookupMeetingDocument($scope.symbol);

                //===========================
                //
                //===========================
                function lookupMeetingDocument(code) {

                    if(!code)
                        return;

                    var isLink = /http[s]?:\/\//.test(code);

                    var result = {
                        symbol: code,
                        title:  {},
                        files:  []
                    };

                    if(isLink) {
                        result.files.push({ language: 'en', url : code, type:'text/html' });
                    }
                    else {
                        result = $http.get("/api/v2016/documents", { cache : true, params : { q : { symbol: code }, fo: 1 } }).then(function(res){
                            return res.data;
                        });
                    }

                    $q.when(result).then(function(doc){
                        $scope.document = doc;
                    });
                }
            }
        };
    }]);
});
