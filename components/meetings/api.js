
import axios from 'axios'
import { isFunction, isEmpty, cloneDeep } from 'lodash'

let sitePrefixUrl = 'https://api.cbd.int';

if(/\.cbd\.int$/i   .test(window.location.hostname)) sitePrefixUrl= 'https://api.cbd.int';
if(/\.cbddev\.xyz$/i.test(window.location.hostname)) sitePrefixUrl= 'https://api.cbddev.xyz';
if(/\localhost$/i   .test(window.location.hostname)) sitePrefixUrl= '/';

const cache          = new Map()
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
  // Meetings {q,f,t,s,l,sk}
  ////////////////////////

  async queryMeetings(params)  {
    return this.http.get(`api/v2016/meetings`, { params }).then(res => res.data).catch(tryCastToApiError);
  }

  async getMeetingById(id, options={})  {

    const q = { _id : mapObjectId(id) };

    return this.queryMeetings({...options, q, fo: 1 });
  }

  getMeetingByCode(code, options={ fo:1 })  {
    const q = { normalizedSymbol: `${code}`.toUpperCase() }

    return this.queryMeetings({q, ...options})
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

  queryInterventions(params) {

    return this.http.get(`api/v2021/meeting-interventions`, { params }).then(res => res.data).catch(tryCastToApiError);
  }

  getInterventionsBySessionId (sessionId, params={}) {

    return this.http.get(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}/interventions`, { params }).then(res => res.data).catch(tryCastToApiError);
  }

  getInterventionById (interventionId) {

    return this.http.get(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}`).then(res => res.data).catch(tryCastToApiError);
  }

  createPendingIntervention(data) {

    delete data.sessionId;
    data.status = 'pending';

    return this.http.post(`api/v2021/meeting-interventions`, data).then(res => res.data).catch(tryCastToApiError);
  }

  createIntervention(sessionId, data) {

    data.status = 'public';
    return this.http.post(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}/interventions`, data).then(res => res.data).catch(tryCastToApiError);
  }

  updateIntervention(interventionId, data) {

    return this.http.put(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}`, data).then(res => res.data).catch(tryCastToApiError);
  }

  deleteIntervention(interventionId, data) {

    return this.http.delete(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}`).then(res => res.data).catch(tryCastToApiError);
  }  


  async getInterventionOrganizations (params = { t:'s' }) {

    return this.http.get(`api/v2021/meeting-interventions/organizations`, { params }).then(res => res.data).catch(tryCastToApiError);
  }

  async getInterventionOrganizationTypes(){
    const url = `api/v2021/meeting-interventions/organization-types`

    let types = null;

    if(cache.has(url)) types = cache.get(url)

    if(!types) {
      types = await this.http.get(url).then(res => res.data).catch(tryCastToApiError);
      cache.set(url, types)
    }

    return  cloneDeep(types);
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

  async uploadInterventionFile(interventionId, fileInfo, fileData) {


    const tempFile = {
        filename : fileData.name,
        metadata : fileData
    };

    const slot = await this.createTemporaryFile(tempFile);
    
    const { contentType }  = slot;

    await this.uploadTemporaryFile(slot.url, fileData, { contentType });

    var data = { ...fileInfo, url: `upload://${slot.uid}` };

    const file = await this.http.post(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}/files`, data).then(res => res.data).catch(tryCastToApiError);

    return file;
  }


  async updateInterventionFile(interventionId, fileId, data){
    
    const file = await this.http.put(`api/v2021/meeting-interventions/${encodeURIComponent(interventionId)}/files/${encodeURIComponent(fileId)}`, data).then(res => res.data).catch(tryCastToApiError);

    return file;
  }   

  //////////////////////////
  // Sessions
  ////////////////////////

  async querySessions(params) {

    const sessions = await this.http.get(`api/v2021/meeting-sessions`, { params }).then(res => res.data).catch(tryCastToApiError);

    return sessions;
  }

  async assignInterventionToSession(sessionId, interventionId, data) {

    const intervention = await this.http.put(`api/v2021/meeting-sessions/${encodeURIComponent(sessionId)}/interventions/${interventionId}`, data).then(res => res.data).catch(tryCastToApiError);

    return intervention;
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
  async createTemporaryFile(fileInfo) {

    const slot = await this.http.post(`api/v2015/temporary-files`, fileInfo).then(res => res.data).catch(tryCastToApiError);

    return slot;
  }

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
  const matches = [ ...args ].filter((m) => !!m && !isEmpty(m));

  if (!matches.length)      return null;
  if (matches.length === 1) return matches[0];

  return { $and: matches };
}
