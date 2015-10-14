define(['app', 'data/in-session/meetings'], function(app, meetingsData) { "use strict";

	return ['$scope', function($scope) {

		$scope.meetings =  meetingsData;

	}];
});
