define(['app', 'lodash', 'data/aichi-targets/targets', 'data/aichi-targets/goals', 'directives/aichi-targets/fisheye', 'directives/aichi-targets/videos', 'directives/aichi-targets/legend42','directives/aichi-targets/box-list','directives/aichi-targets/side-events'], function(app, _, targetsData, goalsData) { 'use strict';

	return ['$location', '$routeParams', function( $location, $routeParams) {

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
});
