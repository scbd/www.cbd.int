define(['lodash', './data/actors'], function(_, actorList) {

    return ['$scope', 'actors', function ($scope, preSelectedActors) {

        preSelectedActors = preSelectedActors || [];

        $scope.groupedActors = _(actorList).reduce(function(r,v) {

            v = _.clone(v, true);

            v.selected = !!~preSelectedActors.indexOf(v.code);

            r[v.group||''] = r[v.group||''] || [];
            r[v.group||''].push(v);

            return r;

        }, {});


        $scope.getSelectedActors = function() {

            return _($scope.groupedActors).values().flatten().where({selected:true}).pluck('code').value();

        };
    }];
});
