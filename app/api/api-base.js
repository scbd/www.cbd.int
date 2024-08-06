import Vue from 'vue'
import axios from 'axios'
import { isFunction } from 'lodash'
export { mapObjectId, isObjectId } from '../services/object-id';

let sitePrefixUrl = window.scbd.apiUrl;

const cache          = new Map()
const defaultOptions = () => ({ 
  prefixUrl: 
  sitePrefixUrl, 
  timeout  : 30 * 1000,
  token : ()=>Vue?.prototype?.$auth?.strategy?.token?.get()
});

export default class ApiBase
{
  constructor(options) {

    options = options || {};

    if(isFunction(options)) options = { token : options }

    const { token, prefixUrl, timeout } = { ...defaultOptions(), ...options }

    const baseConfig = {
      baseURL : prefixUrl,
      timeout,
      token
    }

    const http = async function (...args) {
      console.log(args)
      return (await loadAsyncHeaders(baseConfig))(...args);
    }

    http.get     = async (...args)=> (await loadAsyncHeaders(baseConfig)).get    (...args);
    http.head    = async (...args)=> (await loadAsyncHeaders(baseConfig)).head   (...args);
    http.post    = async (...args)=> (await loadAsyncHeaders(baseConfig)).post   (...args);
    http.put     = async (...args)=> (await loadAsyncHeaders(baseConfig)).put    (...args);
    http.patch   = async (...args)=> (await loadAsyncHeaders(baseConfig)).patch  (...args);
    http.delete  = async (...args)=> (await loadAsyncHeaders(baseConfig)).delete (...args);
    http.options = async (...args)=> (await loadAsyncHeaders(baseConfig)).options(...args);
    http.request = async (...args)=> (await loadAsyncHeaders(baseConfig)).request(...args);

    this.http = http;
  }
}

async function loadAsyncHeaders(baseConfig) {

  const { token, ...config } = baseConfig || {}

  const headers = { ...(config.headers || {}) };

  for(let key of Object.keys(config)) {
    headers[key] = await evaluate(headers[key]);
  }

  if(token) {
      let authorization = await evaluate(token);

      if(authorization && !/^[a-z]+\s/i.test(authorization||''))
        authorization = `Bearer ${authorization}`;

      headers.Authorization = authorization;
  }

  return axios.create({ ...config, headers } );
}

function evaluate(expr) {
  if(typeof expr === 'function') expr = expr();

  return expr;
}

//////////////////////////
// Helpers
////////////////////////

export function tryCastToApiError(error) {

  if(error && error.response && error.response.data && error.response.data.code) {
      const apiError = error.response.data
      throw error.response.data;
  }

  throw error
}

export function stringifyUrlParam(value) {
  if (value instanceof(Date))   {return value.toISOString()}    
  if (value instanceof(Object)) {return JSON.stringify(value)}  
  return value; 
}

export function stringifyUrlParams(valueObj) {
  const returnObj = {};

  for (const [key, value] of Object.entries(valueObj)) {
    if (isValid(value)){
      returnObj[key] = stringifyUrlParam(value);
    }
  }
  
  return returnObj;
}
