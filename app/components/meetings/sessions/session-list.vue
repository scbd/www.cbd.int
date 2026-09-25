<template >
  <div>

    <div class="btn-group float-right">
      <a class="btn btn-outline-dark" :href="newUrl()"><i class="fa fa-plus"></i> New session</a>
      <button type="button" class="btn btn-outline-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" title="Create from a reservation"><i class="fa fa-caret-down"></i></button>
      <div class="dropdown-menu dropdown-menu-right" style="min-width: 30rem; max-width: 40rem">
        <h6 class="dropdown-header d-flex justify-content-between">
          <span>From a reservation ({{ allCandidates ? 'all' : '8h before to 12h after now' }})</span>
          <a v-if="!allCandidates" href="#" class="ml-3" @click.stop.prevent="loadAllCandidates">Load all</a>
          <i v-if="loadingCandidates" class="fa fa-cog fa-spin ml-3"></i>
        </h6>
        <a v-for="r in candidates" :key="r._id" class="dropdown-item" style="white-space: normal" :class="{ 'font-weight-bold': r.start === nearestStart }" :href="`${newUrl()}?reservationId=${encodeURIComponent(r._id)}`">
          {{ r.start | tz(conference.timezone) | formatDate('ccc d MMM T') }}
          <span class="badge" :class="`badge-${r.type.style || 'secondary'}`">{{ r.type.title }}</span>
          {{ reservationMeetingCodes(r).join(' / ') }}
          <br><small class="text-muted">{{ r.title }}</small>
        </a>
        <span v-if="!candidates.length && !loadingCandidates" class="dropdown-item disabled">No candidate reservations</span>
      </div>
    </div>
    <h1>Meeting Sessions
      <small class="text-muted">
        <span v-for="{normalizedSymbol} in meetings" :key="normalizedSymbol">
          {{normalizedSymbol}}
        </span>
      </small>
    </h1>

    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Date</th>
          <th scope="col"></th>
          <th scope="col">Title</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="({ _id, date, title, meetings, timezone }, index) in sessions" :key="_id" :class="{ 'table-success': isInProgress(date)}">
          <th scope="row">{{ sessionNumber(index) }}</th>
          <td>
            {{ date | tz(timezone) | formatDate('d MMMM yyyy - cccc T (z)') }}
            </td>
          <td>
            <i v-for="({ symbol }) in meetings" :key="symbol">{{symbol}}, </i>
          </td>
          <td>
            {{title}}
          </td>
          <td>
            <div class="btn-group" role="group">
              <a class="btn btn-sm btn-outline-dark" :href="getUrl({ _id, meetings })"><i class="fa fa-list"></i></a>
              <a class="btn btn-sm btn-outline-dark" :href="getUrl({ _id, meetings }) + '/edit'"><i class="fa fa-edit"></i></a>
            </div>
            
          </td>
        </tr>
      </tbody>
    </table>
    
  </div>
</template>

<script>

import   Api           , { mapObjectId }from '../api.js'
import { format, timezone }             from '../datetime.js'
import   moment                         from 'moment'
import   remapCode                      from './re-map.js'

// Eunomia reservation types that carry statements: Plenary, High Level Segment, Working Group I & II
const STATEMENT_RESERVATION_TYPES = [ '570fd1ac2e3fa5cfa61d90f5', '5aff32171a0ff600010c28a8', '58379a233456cf0001550cac', '58379a293456cf0001550cad' ];

export default {
  name       : 'SessionsList',
  props      : { 
                  route:       { type: Object, required: false },
                  tokenReader: { type: Function, required: false }
                },
  methods    : { getUrl, newUrl, meetingQuery,conferenceQuery, loadCandidates, loadAllCandidates, reservationMeetingCodes, sessionNumber, isInProgress, now },
  computed   : { now, nearestStart },
  filters    : { formatDate: format, tz: timezone },
  created, 
  data
}

function data(){
  return { 
    sessions: [],
    candidates: [],
    allCandidates: false,
    loadingCandidates: false,
    conference: null,
    routeMeeting: null,
    api: undefined,
    isMeeting: !!this.route?.params?.meeting
  }
}

function getUrl({ _id, meetings }) {
  const { isMeeting } = this;
  const { code, meeting: symbol } = this.route?.params

  if(isMeeting) return  `/meetings/${encodeURIComponent(symbol)}/sessions/${encodeURIComponent(_id)}`
  else          return `/conferences/${encodeURIComponent(code)}/sessions/${encodeURIComponent(_id)}`;
}

function newUrl() {
  return `${this.getUrl({ _id: 'new' })}/edit`;
}

async function created(){
  this.api = new Api(this.tokenReader);

  const isMeeting = this.route?.params?.meeting;
  const q         = isMeeting? await this.meetingQuery() : await this.conferenceQuery();

  this.sessions  = await this.api.querySessions({ q, s: { date:-1 } });

  try     { this.candidates = await this.loadCandidates() }
  catch(e){ console.error('Failed to load candidate reservations', e) }
}

async function loadAllCandidates(){
  this.allCandidates     = true;
  this.loadingCandidates = true;

  try     { this.candidates = await this.loadCandidates({ all: true }) }
  catch(e){ console.error('Failed to load candidate reservations', e) }
  finally { this.loadingCandidates = false }
}

// Reservations that can become a session, same rules as the kronos statements sync:
// statement types, with agenda items, linked to a meeting, starting between 8h before and 12h after now (unless all), and no session with the same _id yet
async function loadCandidates({ all = false } = {}){
  if(!this.conference && this.routeMeeting) this.conference = await this.api.getConferenceByMeetingId(this.routeMeeting._id) || null;
  if(!this.conference) return [];

  const q = {
    'location.conference': this.conference._id,
    type         : { $in: STATEMENT_RESERVATION_TYPES },
    'meta.status': { $nin: [ 'archived', 'deleted' ] },
    'agenda.items.0': { $exists: true },
  };

  if(!all) q.$and = [
    { start: { $gt: { $date: this.now.clone().subtract( 8, 'hours').toISOString() } } },
    { start: { $lt: { $date: this.now.clone().add     (12, 'hours').toISOString() } } },
  ];
  const f = { start: 1, type: 1, title: 1, 'agenda.meetings': 1, 'agenda.meetingIds': 1 };

  const reservations = await this.api.queryReservations({ q, f, s: { start: 1 } }) || [];
  const sessionIds   = new Set(this.sessions.map(o=>o._id));

  const candidates = reservations.filter(r=>{
    const ids   = (r.agenda?.meetingIds || []).map(remapCode);
    const codes = reservationMeetingCodes(r).map(c=>remapCode(c).toUpperCase());

    if(sessionIds.has(r._id))          return false;
    if(!ids.length && !codes.length)   return false;
    if(!this.routeMeeting)             return true;

    return ids.includes(this.routeMeeting._id) || codes.includes(this.routeMeeting.normalizedSymbol);
  });

  if(!candidates.length) return [];

  const types = await this.api.queryReservationTypes([ ...new Set(candidates.map(r=>r.type)) ]);

  return candidates.map(r=>({ ...r, type: types.find(t=>t._id === r.type) || { title: r.type } }));
}

// agenda.meetings maps every conference meeting code to true/false - only true ones are on the reservation
function reservationMeetingCodes(reservation){
  return Object.entries(reservation.agenda?.meetings || {}).filter(([, on])=>on === true).map(([code])=>code);
}

// Start of the candidate(s) nearest to now - parallel reservations can share it
function nearestStart(){
  const distance = r => Math.abs(moment(r.start).diff(this.now));
  const nearest  = this.candidates.reduce((a, r)=> !a || distance(r) < distance(a) ? r : a, null);

  return nearest?.start;
}

async function meetingQuery(){
  const normalizedSymbol = this.route?.params?.meeting?.toUpperCase() || '';

  if(!normalizedSymbol) return null

  const q        = { normalizedSymbol };
  const meetings = await this.api.queryMeetings({q, f: { _id:1, normalizedSymbol:1 }});

  this.routeMeeting = meetings[0] || null;

  return { meetingIds : { $in: meetings.map(m=>mapObjectId(m._id)) } };
}

async function conferenceQuery(){
  const code = remapCode(this.route.params.code);

  if(!code) throw new Error('No meeting id or conference code route param for session list')

  const q          = { 'code': code };
  const conference = await this.api.getConference(code);
  const meetingIds = conference.MajorEventIDs.map(remapCode);

  this.conference = conference;

  return { meetingIds : { $in: meetingIds.map(m=>mapObjectId(m)) } };
}

function sessionNumber(index){
  return this.sessions.length - index
}

function isInProgress(date){

  const isWithin8HoursToStart = moment().isAfter(moment(date).subtract(8, 'hours'))
  const isWithin8HoursToEnd   = moment().isBefore(moment(date).add(8, 'hours'))

  return isWithin8HoursToStart && isWithin8HoursToEnd
}

function now(){
  const { datetime } = this.route.params

  return datetime? moment(datetime) : moment()
}
</script>
