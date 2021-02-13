
import ky from 'ky'
import { isFunction } from 'lodash'
import { deleteFalsyKey } from './util.js'

const defaultOptions = { prefixUrl: 'https://api.cbddev.xyz', timeout  : 30 * 1000 } //https://api.cbd.int 'https://api.cbddev.xyz' 'http://localhost:8000'

export default class Api
{
    constructor(options) {

      options = options || {};

      if(isFunction(options)) options = { tokenReader : options }

      const { tokenReader, prefixUrl, timeout } = { ...defaultOptions, ...options }

      const kyOptions = { prefixUrl, timeout };

      if(tokenReader) {
        const hooks = { 
          beforeRequest: [ 
            async (request) => request.headers.set('Authorization', `Token ${await tokenReader()}`) 
          ]
        }

        kyOptions.hooks = hooks; 
      }

      this.http = ky.create(kyOptions)  
    }

  //////////////////////////
  // Meetings
  ////////////////////////

  async queryMeetings({q,f,t,s,l,sk})  {

    const searchParams = toURLSearchParams({q,f,t,s,l,sk})
    const meeting      = await this.http.get(`api/v2016/meetings`, { searchParams }).json(); //, { searchParams }

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
    const conference = await this.http.get(`api/v2016/conferences`, { searchParams }).json();

    return conference
  }

  //////////////////////////
  // Interventions
  ////////////////////////

  async queryInterventions({q,f,t,s,l,sk}) {

    const searchParams  = toURLSearchParams({q,f,t,s,l,sk});
    const interventions = await this.http.get(`api/v2021/meeting-interventions`, { searchParams }).json();

    return interventions
  }

  async getInterventionsBySessionId (sessionId, options={}) {

    const {q,f,t,s,l,sk} = options;

    const searchParams  = toURLSearchParams({q,f,t,s,l,sk});
    const interventions = await this.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}/interventions`, { searchParams }).json();

    return interventions
  }

  async getInterventionById (interventionId) {

    const interventions = await this.http.get(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}`).json();

    return interventions
  }

  //////////////////////////
  // Sessions
  ////////////////////////

  async querySessions({q,t,s,l,sk}) {

    const searchParams = toURLSearchParams({q,t,s,l,sk});
    const sessions     = await this.http.get(`api/v2021/meeting-sessions`, { searchParams }).json();

    return sessions
  }

  async getSessionById(sessionId, includeInterventions=false) {

    let session       = this.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}`).json();
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
    const data         = await this.http.get('api/v2021/meeting-sessions', { searchParams }).json();

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