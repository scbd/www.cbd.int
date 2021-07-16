import moment from 'moment-timezone'

const browserTimezone = (Intl && Intl.DateTimeFormat)? Intl.DateTimeFormat().resolvedOptions().timeZone  : moment.tz.guess(true)

export const getTimezone = () => {

  return  localStorage.getItem('timezone') || browserTimezone
}
