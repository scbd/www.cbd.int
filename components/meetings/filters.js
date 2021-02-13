import { DateTime } from 'luxon'

//https://moment.github.io/luxon/docs/manual/formatting#table-of-tokens
export const dateTimeFilter = (isoDateString, format='T') => (DateTime.fromISO(isoDateString).setZone('utc')).toFormat(format)