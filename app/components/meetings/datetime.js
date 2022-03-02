import { DateTime } from 'luxon'

export function timezone(dateTime, tz=null) {
    dateTime = dateTime && asDateTime(dateTime);

    if(dateTime) dateTime = dateTime.setZone(tz||'local');

    return dateTime;
}

//https://moment.github.io/luxon/docs/manual/formatting#table-of-tokens

export function format(dateTime, format='T') {
    return dateTime && asDateTime(dateTime).toFormat(format)
}

export function asDateTime(date) {
    if(date instanceof DateTime)  return date
    if(date instanceof Date)      return DateTime.fromJSDate(date)
    if(typeof(date) === 'string') return DateTime.fromISO(date)

    throw Error('Unknown date/time format');
}