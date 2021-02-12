


export const isConference = () => {
  const { pathname } = window.location

  return pathname.startsWith('/conferences/')
}

export const isMeeting = () => {
  const { pathname } = window.location

  return pathname.startsWith('/meetings/')
}

export const getMeetingCode = () => {
  const { pathname } = window.location

  if(isMeeting())
    return (pathname.split('/') || [])[2]
  if(isConference())
    return (pathname.split('/') || [])[3]
  else return ''
  //else throw new Error('Sessoins component not used on conference or meeting page')
}

export const getSessionId= () => {
  const { pathname } = window.location

  return (pathname.split('/') || [])[4]

}

export const getConferenceCode = () => {
  const { pathname } = window.location
  const parts        = pathname.split('/');

  if(isConference() && parts.length > 2)
    return parts[2]
  else return ''
}