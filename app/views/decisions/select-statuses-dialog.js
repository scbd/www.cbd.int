define(['lodash', './select-statuses-list'], function(_, statusList) {

    return ['$scope', 'statuses', function ($scope, preSelectedStatuses) {

        preSelectedStatuses = preSelectedStatuses || [];

        $scope.statuses = _(statusList).map(function(v) {

            v = _.clone(v, true);
            v.selected = !!~preSelectedStatuses.indexOf(v.code);

            return v;

        }).value();


        $scope.getSelectedStatuses = function() {

            return _($scope.statuses).where({selected:true}).pluck('code').value();

        };
    }];
});
