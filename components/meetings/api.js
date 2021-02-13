
import ky from 'ky'
import { isFunction } from 'lodash'
import { deleteFalsyKey } from './util.js'

let sitePrefixUrl = 'https://api.cbddev.xyz';

if(/\.cbd\.int$/i   .test(window.location.hostname)) sitePrefixUrl= 'https://api.cbd.int';
if(/\.cbddev\.xyz$/i.test(window.location.hostname)) sitePrefixUrl= 'https://api.cbddev.xyz';
if(/\localhost$/i   .test(window.location.hostname)) sitePrefixUrl= 'http://localhost:8000';

const defaultOptions = { prefixUrl: sitePrefixUrl, timeout  : 30 * 1000 }

export default class Api
{
    constructor(options) {

      options = options || {};

      if(isFunction(options)) options = { tokenReader : options }

      const { tokenReader, prefixUrl, timeout } = { ...defaultOptions, ...options }

      const kyOptions = { prefixUrl, timeout };

      if(tokenReader) {
        const hooks = { beforeRequest: [ async (request) => request.headers.set('Authorization', `Token ${await tokenReader()}`) ] }
        kyOptions.hooks = hooks; 
      }

      this.http = ky.create(kyOptions)  
    }

  //////////////////////////
  // Meetings
  ////////////////////////

  async queryMeetings({q,f,t,s,l,sk})  {

    const searchParams = toURLSearchParams({q,f,t,s,l,sk})
    const meeting      = await this.http.get(`api/v2016/meetings`, { searchParams }).json().catch(tryCastToApiError); //, { searchParams }

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

    const searchParams  = toURLSearchParams({ q, fo: 1});
    const conference = await this.http.get(`api/v2016/conferences`, { searchParams }).json().catch(tryCastToApiError);

    return conference
  }

  //////////////////////////
  // Interventions
  ////////////////////////

  async queryInterventions({q,f,t,s,l,sk}) {

    const searchParams  = toURLSearchParams({q,f,t,s,l,sk});
    const interventions = await this.http.get(`api/v2021/meeting-interventions`, { searchParams }).json().catch(tryCastToApiError);

    return interventions
  }

  async getInterventionsBySessionId (sessionId, options={}) {

    const {q,f,t,s,l,sk} = options;

    const searchParams  = toURLSearchParams({q,f,t,s,l,sk});
    const interventions = await this.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}/interventions`, { searchParams }).json().catch(tryCastToApiError);

    return interventions
  }

  async getInterventionById (interventionId) {

    const interventions = await this.http.get(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}`).json().catch(tryCastToApiError);

    return interventions
  }

  //////////////////////////
  // Interventions Files
  ////////////////////////

  async createInterventionFileSlot(pass, data){
    const headers = new Headers();

    headers.append("Authorization", "Pass "+pass);
    headers.append("Content-Type", "application/json");
    
    const requestOptions = {
      method  : 'POST',
      headers : headers,
      body    : JSON.stringify(data)
    };

    const slot = await this.http("api/v2021/meeting-interventions/slot", requestOptions).json().catch(tryCastToApiError);

    return slot;
}

  async commitInterventionFileSlot(slotId, passCode, meetingId){
    if(!slotId) throw new Error("slotId is empty")

    const headers = new Headers();

    headers.append("Authorization", "Pass "+passCode);
    headers.append("Content-Type", "application/json");
    
    const data = { meetingId:  meetingId };

    let requestOptions = {
        method  : 'PUT',
        headers : headers,
        body    : JSON.stringify(data)
    };

    const intervention = await this.http(`api/v2021/meeting-interventions/slot/${encodeURIComponent(slotId)}/commit`, requestOptions).catch(tryCastToApiError);

    return intervention;
  }


  //////////////////////////
  // Sessions
  ////////////////////////

  async querySessions({q,t,s,l,sk}) {

    const searchParams = toURLSearchParams({q,t,s,l,sk});
    const sessions     = await this.http.get(`api/v2021/meeting-sessions`, { searchParams }).json().catch(tryCastToApiError);

    return sessions
  }

  async getSessionById(sessionId, includeInterventions=false) {

    let session       = this.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}`).json().catch(tryCastToApiError);
    let interventions = null;

    if(includeInterventions) {
      interventions = this.getInterventionsBySessionId(sessionId, { s: { datetime: -1 }});
    }

    session = await session;
    interventions = await interventions;

    return { ...session, interventions }
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
    const searchParams = toURLSearchParams({ q, f, s });
    const data         = await this.http.get('api/v2021/meeting-sessions', { searchParams }).json().catch(tryCastToApiError);

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

export async function tryCastToApiError(error) {

  if(error && error.response) {
      const apiError = await error.response.json().catch(e=>{console.log(e); return null});

      if(apiError) throw apiError;
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

function toURLSearchParams(params) {
  if (!params) return undefined;

  params=deleteFalsyKey(params)

  const urlEncodedUrlParams = {};
  const paramKeys           = Object.keys(params);

  paramKeys.forEach((key) => {
    let value = params[key];

    if (value instanceof Object) value = JSON.stringify(value, null, '');
    else if (value instanceof Date) value = value.toISOString();

    urlEncodedUrlParams[key] = value;
  });

  return new URLSearchParams(urlEncodedUrlParams);
}