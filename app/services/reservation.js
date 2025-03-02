import   moment        from 'moment-timezone'

const defaultCloseTime = 15 // minutes
export const now  = () => new Date(new URL(location).searchParams.get('datetime') || new Date());

export const hasConnection = (reservation) => {
  if(!reservation ) throw new Error(`hasConnection: reservation not passed to function`)

  const { video, videoUrl } = reservation

  return video && videoUrl
}

export const isConnectionDone = (reservation, schedule) => {
  if(!reservation) throw new Error(`isConnectionDone: reservation or schedule not passed to function`)

  const { end, videoUrlMinutes } = reservation;
  const { closeAccessDelayTime } = schedule?.connection || { };
  const endDate                  = moment(end).add(videoUrlMinutes || closeAccessDelayTime || defaultCloseTime || 0, 'minutes').toDate();

  return now() > endDate
}

export const getConnectionInitPreStartMinutes = (reservation, schedule) => {
  if(!reservation || !schedule?.connection)  return 0;

  const { type }         = reservation
  const { initTimes }    = schedule.connection
  const   isTypeString   = typeof type === 'string'
  const   types          = Object.keys(initTimes)
  const   typeIdentifier = isTypeString? type : type._id
  const   isInTypes      = types.includes(typeIdentifier)
  
  return isInTypes? initTimes[typeIdentifier] : initTimes.default
}

export const getNowToConnectInitDuration = (reservation, schedule) => {

  const { type, start }      = reservation
  const   minutesDefault     = getConnectionInitPreStartMinutes({ type }, schedule)
  const   canConnectTime     = moment(start).subtract(minutesDefault, 'm')
  const   dateTimeDifference = canConnectTime.diff(now())

  return getDurationPlainObject(dateTimeDifference)
}

export const getNowToStartDuration = (reservation) => {

  const { start       }      = reservation
  const   startMoment        = moment(start)
  const   dateTimeDifference = startMoment.diff(now())

  return getDurationPlainObject(dateTimeDifference)
}

export const canConnect = (reservation, schedule) => {
  const { type, start }   = reservation
  const   minutes         = getConnectionInitPreStartMinutes({ type }, schedule)
  const   canConnectTime  = moment(start).subtract(minutes, 'm').toDate()

  return now() >= canConnectTime
}

export const isInProgress = ({ start, end }) => {
  const startDate = moment(start).toDate()
  const endDate   = moment(end).toDate()

  return startDate <= now()  && now()  <= endDate
}

export const isConnectionTestingInProgress = ({ start, type }, { connection }) => { //params: reservation, t_event_group.schedule
  const   connectionTestingPreStart   = getConnectionInitPreStartMinutes({ type }, { connection })
  const   startDate                   = moment(start)
  const   testingStart                = moment(startDate).subtract(connectionTestingPreStart || 0, 'minutes')

  return testingStart.toDate() <= now() && now()  <= startDate.toDate()
}

function getDurationPlainObject(dateTimeDifference){ // moment difference

  const dateTimeDifferenceDuration = moment.duration(dateTimeDifference)

  const days    = Math.abs(dateTimeDifferenceDuration.days());
  const hours   = Math.abs(dateTimeDifferenceDuration.hours());
  const minutes = Math.abs(dateTimeDifferenceDuration.minutes());

  return { days, hours, minutes }
}