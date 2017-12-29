define(['app', 'text!./meeting.html', 'lodash', 'filters/lstring', 'filters/moment'], function(app, template, _) { 'use strict';

	return app.directive('decisionMeeting', ['$http', function($http) {
		return {
			restrict : "E",
			template : template,
            replace: true,
			scope: {
                symbol:"<",
            },
			link: function ($scope) {

                lookupMeeting($scope.symbol);

                //===========================
                //
                //===========================
                function lookupMeeting(code) {

                    if(!code)
                        return;

                    if(isUrl(code||'')) {
                        $scope.url = code;
                        return;
                    }

                    $scope.url  = '/meetings/'+encodeURIComponent(code);

                    $http.get("/api/v2016/meetings/"+code.toUpperCase(), { cache: true, params: { f: { symbol:1, EVT_CD:1, EVT_FROM_DT:1, EVT_TO_DT:1, title:1, dateText:1, venueText:1 } } }).then(function(res){

                        $scope.url  = '/meetings/'+encodeURIComponent(res.data.symbol||res.data.EVT_CD||code);

                        $scope.meeting = _.defaults({}, res.data, {
                            symbol:    res.data.EVT_CD,
                            startDate: res.data.EVT_FROM_DT,
                            endDate:   res.data.EVT_TO_DT,
                        });

                        console.log($scope.meeting);
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
});
