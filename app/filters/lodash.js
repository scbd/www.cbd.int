define(['app', 'lodash'], function(app, _) { 'use strict';

    app.filter('_', [function() {

        return function(collection, fn, a, b, c, d, e, f) {

            if(!collection)
                return collection;

            return _[fn](collection, a, b, c, d, e, f);
        };
    }]);
});
