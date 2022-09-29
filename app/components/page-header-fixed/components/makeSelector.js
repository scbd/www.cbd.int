import { camelCase  } from 'lodash'

const makeSelector = ({ name, position }, postFixRaw) => {
  const cleanName  = camelCase(name.replace(/[^A-Za-z0-9\s]/ig, ''))
  const postFix    = postFixRaw? `-${postFixRaw? postFixRaw.toUpperCase() : ''}` : ''
  const pos        = position? `P${getPosition(position)}` : ''

  return `${cleanName}${pos}${postFix}`
}

function getPosition(p){ return Array.isArray(p)? p[0] : p }

export default makeSelector