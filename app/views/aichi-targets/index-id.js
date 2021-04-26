import '~/directives/aichi-targets/fisheye'
import '~/directives/aichi-targets/videos'
import '~/directives/aichi-targets/legend42'
import '~/directives/aichi-targets/box-list'
import '~/directives/aichi-targets/side-events'
import _ from 'lodash'
import targetsData from '~/data/aichi-targets/targets.json'
import goalsData from '~/data/aichi-targets/goals.json'


export { default as template } from './index-id.html';


export default ['$location', '$routeParams', function( $location, $routeParams) {

		var _ctrl = this;

		var targetId = parseInt($routeParams.targetId);

		if(!_.inRange(targetId,1, 21))
			$location.path('/404');

		_ctrl.searchRes = '';
		_ctrl.target = _.findWhere(targetsData.targets, {'id' : targetId});
		_ctrl.goal = _.findWhere(goalsData.goals, {'goal': _ctrl.target.goal.en});
		// _ctrl.lh = '';
		getTargetActivity(targetId);


		//============================================================
    //
    //============================================================
    function getTargetActivity (target) {
        if(target && _ctrl.target.activities){
            var max = _ctrl.target.activities.length;
            var rnd = Math.floor(Math.random() * max );
            _ctrl.activity = _ctrl.target.activities[rnd];
        }
    }


	}];