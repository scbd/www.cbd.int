


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
    return pathname.replace('/meetings/', '')
  if(isConference())
    return (pathname.split('/') || [])[3]
  else return ''
  //else throw new Error('Sessoins component not used on conference or meeting page')
}