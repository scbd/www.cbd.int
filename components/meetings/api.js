
import axios from 'axios'
import { isFunction } from 'lodash'

let sitePrefixUrl = 'https://api.cbd.int';

if(/\.cbd\.int$/i   .test(window.location.hostname)) sitePrefixUrl= 'https://api.cbd.int';
if(/\.cbddev\.xyz$/i.test(window.location.hostname)) sitePrefixUrl= 'https://api.cbddev.xyz';
if(/\localhost$/i   .test(window.location.hostname)) sitePrefixUrl= '/';

const defaultOptions = { prefixUrl: sitePrefixUrl, timeout  : 30 * 1000 }

export default class Api
{
    constructor(options) {

      options = options || {};

      if(isFunction(options)) options = { tokenReader : options }

      const { tokenReader, prefixUrl, timeout, tokenType } = { ...defaultOptions, ...options }


      const baseConfig = {
        baseURL : prefixUrl,
        timeout,
        tokenReader
      }

      const http = async function (...args) {
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

  ////////////////////////
  // Meetings
  ////////////////////////

  async queryMeetings({q,f,t,s,l,sk})  {

    const searchParams = {q,f,t,s,l,sk}
    const meeting      = await this.http.get(`api/v2016/meetings`, { params: searchParams }).then(res => res.data).catch(tryCastToApiError); //, { params: searchParams }

    return meeting;
  }

  async getMeetingById(id, options={})  {

    const q = { _id: mapObjectId(codeOrId) }
    const f = (options||{})

    const  meetings = await this.queryMeetings({q, f, l:1})
    const [meeting] = meetings;

    return meeting;
  }

  async getMeetingByCode(code, options={})  {

    const q = { normalizedSymbol: `${code}`.toUpperCase() }
    const f = (options||{})

    const  meetings = await this.queryMeetings({q, f, l:1})
    const [meeting] = meetings;

    return meeting;
  }

  //////////////////////////
  // Conference
  ////////////////////////
  async getConference(code){

    const q = { code };

    const searchParams  = { q, fo: 1};
    const conference = await this.http.get(`api/v2016/conferences`, { params: searchParams }).then(res => res.data).catch(tryCastToApiError);

    return conference
  }

  //////////////////////////
  // Interventions
  ////////////////////////

  async queryInterventions({q,f,t,s,l,sk}) {

    const searchParams  = {q,f,t,s,l,sk};
    const interventions = await this.http.get(`api/v2021/meeting-interventions`, { params: searchParams }).then(res => res.data).catch(tryCastToApiError);

    return interventions
  }

  async getInterventionsBySessionId (sessionId, options={}) {

    const {q,f,t,s,l,sk} = options;

    const searchParams  = {q,f,t,s,l,sk};
    const interventions = await this.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}/interventions`, { params: searchParams }).then(res => res.data).catch(tryCastToApiError);

    return interventions
  }

  async getInterventionById (interventionId) {

    const interventions = await this.http.get(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}`).then(res => res.data).catch(tryCastToApiError);

    return interventions
  }

  //////////////////////////
  // Interventions Files
  ////////////////////////

  async createInterventionFileSlot(passCode, data){
    
    const headers = {
      Authorization : `Pass ${passCode}`
    };

    const slot = await this.http.post("api/v2021/meeting-interventions/slot", data, { headers }).then(res => res.data).catch(tryCastToApiError);

    return slot;
}

  async commitInterventionFileSlot(slotId, passCode, meetingId){
    if(!slotId) throw new Error("slotId is empty")

    const headers = {
      Authorization : `Pass ${passCode}`
    }

    const data = { meetingId:  meetingId };

    const intervention = await this.http.put(`api/v2021/meeting-interventions/slot/${encodeURIComponent(slotId)}/commit`, data, { headers }).catch(tryCastToApiError);

    return intervention;
  }


  //////////////////////////
  // Sessions
  ////////////////////////

  async querySessions({q,t,s,l,sk}) {

    const searchParams = {q,t,s,l,sk};
    const sessions     = await this.http.get(`api/v2021/meeting-sessions`, { params: searchParams }).then(res => res.data).catch(tryCastToApiError);

    return sessions
  }

  async getSessionById(sessionId, includeInterventions=false) {

    let session       = this.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}`).then(res => res.data).catch(tryCastToApiError);
    let interventions = null;

    if(includeInterventions) {
      interventions = this.getInterventionsBySessionId(sessionId, { s: { datetime: -1 }});
    }

    session = await session;
    interventions = await interventions;

    return { ...session, interventions }
  }

  //////////////////////////
  // Temporary Files
  ////////////////////////
  async uploadTemporaryFile(url, file, options={}) {

    const { headers, timeout, contentType, onUploadProgress, onDownloadProgress }= { ...(options||{}) };

    const config = {
      headers: headers ||{},
      timeout: timeout || 60 * 60 * 1000,
      onUploadProgress, 
      onDownloadProgress
    };
    
    if(options.contentType) config.headers['Content-Type'] = options.contentType;

    await axios.put(url, file, config);
  }

  //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
  //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
  //             TO REVIEW
  //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
  //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

  async getSessions(code) {
    const q            = makeMeetingConferenceQuery (code) // code? { 'meetings.symbol': { $in:[code]} } : {}
    const f            = { startDate: 1 , title: 1 }
    const s            = { startDate: 1 }
    const searchParams = { q, f, s };
    const data         = await this.http.get('api/v2021/meeting-sessions', { params: searchParams }).then(res => res.data).catch(tryCastToApiError);

    const interventionsPromises = []

    if(!code) return data

    for (const [ index, row ] of data.entries())
      interventionsPromises[index] = this.getInterventionsBySessionId(row._id)

    const interventions = await Promise.all(interventionsPromises)

    for (const [ index, row ] of data.entries())
      data[index] = { ...row, interventions: interventions[index] }

    return data
  }
}

async function loadAsyncHeaders(baseConfig) {

  const { tokenReader, tokenType, ...config } = { ...baseConfig };

  const headers = { ...(config.headers || {}) };

  if(tokenReader) {
    const token = await tokenReader();
    headers.Authorization = `${tokenType||'Token'} ${token}`;
  }

  return axios.create({ ...config, headers } );
}

function makeMeetingConferenceQuery (code){
  const meetingOrConferenceIdentifier = Array.isArray(code)? code : [code]
  const isMeeting                     = { 'meeting.symbol': { $in: meetingOrConferenceIdentifier } }
  const isMeetings                    = { 'meetings.symbol': { $in: meetingOrConferenceIdentifier } }
  const isConference                  = { conferenceId: { $in: meetingOrConferenceIdentifier } }
  const $or                           = [ isMeeting, isMeetings, isConference ]
  
  return { $or }
}

function groupInterventionBySession(interventions){
  const sessions = []


  for (const key of getAllSessions(interventions)){
    const session       = interventions.filter(({ sessionId })=> sessionId === key)
    const sessionGroups = groupSessionByPending(session)

    sessions.push(sessionGroups)
  }

  return sessions
}

function groupSessionByPending(interventions){
  const pending    = interventions.filter(({ status }) => status === 'pending')
  const notPending = interventions.filter(({ status }) => status !== 'pending')

  return pending.length? [ pending, notPending ] : interventions
}

function getAllSessions(interventions){
  return Array.from(new Set(interventions.map(({ sessionId }) => sessionId)))
}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//             TO REVIEW
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


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

export function mapObjectId(id){
  return isObjectId(id)? { $oid: id } : id
}

export function isObjectId(id){
  return /^[a-f0-9]{24}/i.test(id);
}

export function mergeQueries(...args) {
  const matches = [ ...args ].filter((m) => !!m);

  if (!matches.length)      return null;
  if (matches.length === 1) return matches[0];

  return { $and: matches };
}
