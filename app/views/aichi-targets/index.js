import _ from 'lodash'
import targetsData from '~/data/aichi-targets/targets.json'
import goalsData   from '~/data/aichi-targets/goals.json'
console.log('aa')

export { default as template } from './index.html';

export default ['$scope', function ($scope) {

        var _ctrl = this;
		_ctrl.targets = _.sortBy(_.cloneDeep(targetsData.targets), 'id');

		//============================================================
		//
		//============================================================
		$scope.getGoal = function (goal) {
			return _.findWhere(goalsData.goals, {goal: goal});
		};

    }];