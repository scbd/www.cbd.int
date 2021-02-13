
import ky from 'ky'
import { deleteFalsyKey } from './util.js'

const globals = { http: undefined }
const defaultOptions = { prefixUrl: 'https://api.cbddev.xyz', timeout  : 30 * 1000 } //https://api.cbd.int 'https://api.cbddev.xyz' 'http://localhost:8000'
export const addApiOptions = (options = {}) => {
  const { tokenReader, prefixUrl, timeout } = { ...defaultOptions, ...options }
  const   hooks                             = tokenReader? { beforeRequest: [ async (request) => { request.headers.set('Authorization', `Token ${await tokenReader()}`); }, ], } : ''
  const   kyOptions                         = hooks? { prefixUrl, timeout, hooks } : { prefixUrl, timeout }

  globals.http    = ky.create(kyOptions)

  return globals.http
}
addApiOptions()
export const getSessions = async (code) => {
  const q            = makeMeetingConferenceQuery (code) // code? { 'meetings.symbol': { $in:[code]} } : {}
  const f            = { startDate: 1 , title: 1 }
  const s            = { startDate: 1 }
  const searchParams = toURLSearchParams({ q, f, s });
  const data         = await globals.http.get('api/v2021/meeting-sessions', { searchParams }).json();

  const interventionsPromises = []

  if(!code) return data

  for (const [ index, row ] of data.entries())
    interventionsPromises[index] = getInterventionsBySession(row._id)

  const interventions = await Promise.all(interventionsPromises)

  for (const [ index, row ] of data.entries())
    data[index] = { ...row, interventions: interventions[index] }

  return data
}

export const getSession = async (_id) => {
  const data          = await globals.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(_id)}`).json();
  const interventions = await getInterventionsBySession(data._id)

  return { ...data, interventions }
}

export const getInterventionsBySession = async (meetingSessionId) => {
  const searchParams = toURLSearchParams({ s: { datetime: 1 },  f: { datetime:1, agendaItem:1, datetime:1, title:1, organizationType:1, status:1, files:1 } });
  const data         = await globals.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(meetingSessionId)}/interventions`, { searchParams }).json();

  return data
}

export const getInterventions = async (code, t) => {

  const q = isPlainObject(code)? code : makeMeetingConferenceQuery (code)

  const searchParams = toURLSearchParams({ t, q, s: { datetime: 1, _id: 1} }); //,  f: { datetime:1, agendaItem:1, datetime:1, title:1, organizationType:1, status:1, files:1 }
  const data         = await globals.http.get(`api/v2021/meeting-interventions`, { searchParams }).json(); //, { searchParams }

  return groupBySession(data)
}

export const getAgendaItems = async (code) => {
  const meetingCodes = await getMeetingCodes(code)

  return getAgendaItemsByMeeting(meetingCodes || code)
}

export const getAgendaItemsByMeeting = async (code) => {
  const identifier   = (Array.isArray(code)? code : [code]).map(mapObjectId)
  const q            = { $or: [ { EVT_CD: { $in: identifier } }, { _id: { $in: identifier } } ] }
  const searchParams = toURLSearchParams({ q, f: { agenda: 1, EVT_CD: 1 } }); 
  const data         = await globals.http.get(`api/v2016/meetings`, { searchParams }).json(); 

  return data.map(mapRawAgendaItems)
}

export const getDatesByMeeting = async (code) => {
  const identifier   = (Array.isArray(code)? code : [code]).map(mapObjectId)
  const q            = { $or: [ { EVT_CD: { $in: identifier } }, { _id: { $in: identifier } } ] }
  const searchParams = toURLSearchParams({ q, f: { EVT_FROM_DT: 1, EVT_TO_DT: 1 }, s:{EVT_HOME_BEG_DT:1} }); 
  const data         = await globals.http.get(`api/v2016/meetings`, { searchParams }).json(); 

  return getDates(data)
}

function getDates(data){
  const lastIndex = data.length? data.length-1: 0
  const start = new Date(data[0].EVT_FROM_DT)
  const end   = new Date(data[lastIndex].EVT_TO_DT)
  const dates =[]

  while(start<=end){
    dates.push((new Date(start)).toISOString())
    start.setDate(start.getDate()+1)
  }
  return dates
}
// EVT_HOME_BEG_DT: "2020-11-17T00:00:00.000Z"
// EVT_HOME_END_DT: "2021-02-26T00:00:00.000Z"
//getAgendaItemsByConference('sbstta24-sbi3')
function mapRawAgendaItems({ EVT_CD, agenda }){
  return { name: EVT_CD, items: agenda.items.map(mapAgendaItems(EVT_CD))}
}

export const getMeetingCodes = async (code) => {
  const q            = { $or : [ { code }, { _id: mapObjectId(code) }] }
  const searchParams = toURLSearchParams({ q, f: { MajorEventIDs: 1, MinorEventIDs: 1 } })
  const data         = await globals.http.get(`api/v2016/conferences`, { searchParams }).json(); //, { searchParams }


  return data.length? [...data[0].MajorEventIDs, ...data[0].MinorEventIDs ] : undefined
}

function makeMeetingConferenceQuery (code){
  const meetingOrConferenceIdentifier = Array.isArray(code)? code : [code]
  const isMeeting                     = { 'meeting.symbol': { $in: meetingOrConferenceIdentifier } }
  const isMeetings                    = { 'meetings.symbol': { $in: meetingOrConferenceIdentifier } }
  const isConference                  = { conferenceId: { $in: meetingOrConferenceIdentifier } }
  const $or                           = [ isMeeting, isMeetings, isConference ]
  
  return { $or }
}

function groupBySession(interventions){
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

function isPlainObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]' && o?.constructor?.name === 'Object';
}

function mapObjectId(id){
  return isObjectId(id)? { $oid: id } : id
}

function isObjectId(id){
  return id.length==24? /[a-f]+/.test(id) : false
}

function getMeetingAcronym(meeting){
  const acronyms = ['cbd', 'cp', 'np', 'sbstta', 'sbi']

  for (const acronym of acronyms) 
    if(meeting.toLowerCase().includes(acronym))
      return acronym.toUpperCase()+' '
  
  return ''
}

function mapAgendaItems(meeting){ 
  return ({ item })=>{
    const acronym = getMeetingAcronym(meeting)

    return { identifier:`${meeting}~${item}`, meeting, item, name: `${acronym}${item}`}
  }
}