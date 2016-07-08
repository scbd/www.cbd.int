define(['app', 'lodash', 'data/aichi-targets/targets', 'data/aichi-targets/goals', 'directives/aichi-targets/fisheye', 'directives/aichi-targets/videos'], function(app, _, targetsData, goalsData) { 'use strict';

	return ['$scope', '$location', '$routeParams', function($scope, $location, $routeParams) {

		var _ctrl = this;

		$scope.targetId = parseInt($routeParams.targetId);

		if(!_.inRange($scope.targetId,1, 21))
			$location.path('/404');

		_ctrl.target = _.findWhere(targetsData.targets, {'id' : $scope.targetId});
		_ctrl.goal = _.findWhere(goalsData.goals, {'goal': _ctrl.target.goal.en});




		//============================================================
        //
        //============================================================
        $scope.getTargetActivity = function (target) {
            if(target && _ctrl.target.activities){
                var max = _ctrl.target.activities.length;
                var rnd = Math.floor(Math.random() * max );

                _ctrl.activity = _ctrl.target.activities[rnd];
            }
        };

		//============================================================
        //
        //============================================================
        $scope.$watch('targetId', function(newValue) {
            $scope.getTargetActivity(newValue);
        });

	}];
});
