import app from '~/app'
import moment from 'moment-timezone'


    app.filter('moment', [() => momentTimezone]);
    app.filter('momentUtc', [() => momentUtc]);
    app.filter('fromNow', () => fromNow);    
    //============================================================
    //
    //============================================================

    export function momentTimezone(datetime, method, arg1, arg2, arg3) {
            
        if(!datetime) return;

        return method ? moment(datetime)[method](arg1, arg2, arg3)
                        : moment(datetime);
    };

    export function momentUtc(datetime, method, arg1, arg2, arg3) {

        if(!datetime) return;

        return method ? moment.utc(datetime)[method](arg1, arg2, arg3)
                      : moment.utc(datetime);
    };

    export function fromNow(date, unitOfTime) {

        if(!date) return "";

        if(unitOfTime) return moment(date).startOf(unitOfTime).fromNow();

        return moment(date).fromNow();
    };

