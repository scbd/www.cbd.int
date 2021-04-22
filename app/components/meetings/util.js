

export const  isPlainObject = (o) => {
  return Object.prototype.toString.call(o) === '[object Object]' && o?.constructor?.name === 'Object';
}

export const isEmpty = (o) =>{
  if(!o) return true
  if(Array.isArray(o)) return !o.length
  if(isPlainObject(o)) return !Object.keys(o).length

  return false
}

export const deleteFalsyKey = (obj) => {

  if(Array.isArray(obj))
    for (let index = 0; index < obj.length; index++) {
      if(isPlainObject(obj[index]) || Array.isArray(obj[index])) 
        if(isEmpty(obj)) obj.splice(index)
        else
          obj[index] = deleteFalsyKey(obj[index]);
      else if(typeof obj[index] === 'undefined' || obj[index] === null || obj[index] === '')
        obj.splice(index)
    }
  else if(obj && isPlainObject(obj))
    for (const key of Object.keys(obj))
      if((Array.isArray(obj[key]) || isPlainObject(obj[key])) && !isEmpty(obj)) deleteFalsyKey(obj[key])
      else if((typeof obj[key] === 'undefined' || obj[key] === null || obj[key] === '') ) delete obj[key]

  return obj
}

export const unique = (array) => {
  return Array.from(new Set(array.map((el)=>{ if(isPlainObject(el)) return JSON.stringify(el); else return el}))).map(jsonParse)
}

