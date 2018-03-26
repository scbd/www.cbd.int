define(['app', 'moment-timezone'], function(app, moment) { 'use strict';

    app.filter('moment', [function() {

        return function(datetime, method, arg1, arg2, arg3) {
            
            if(!datetime)
                return;

            return method ? moment(datetime)[method](arg1, arg2, arg3)
                          : moment(datetime);
        };
    }]);
    app.filter('momentUtc', [function() {

        return function(datetime, method, arg1, arg2, arg3) {

            if(!datetime)
                return;

            return method ? moment.utc(datetime)[method](arg1, arg2, arg3)
                          : moment.utc(datetime);
        };
    }]);
    //============================================================
    //
    //============================================================
    app.filter('fromNow', function () {
        return function (date, unitOfTime) {

            if(!date)
                return "";

            if(unitOfTime)
                return moment(date).startOf(unitOfTime).fromNow();

            return moment(date).fromNow();
        };
    });
});
