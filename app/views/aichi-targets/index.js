define(['app', 'lodash', 'data/aichi-targets/targets', 'data/aichi-targets/goals'], function(app, _, targetsData, goalsData) { 'use strict';

	return ['$scope', function ($scope) {

        var _ctrl = this;

		_ctrl.targets = _.sortBy(_.cloneDeep(targetsData.targets), 'id');

		//============================================================
		//
		//============================================================
		$scope.getGoal = function (goal) {
			return _.findWhere(goalsData.goals, {goal: goal});
		};

    }];
});
