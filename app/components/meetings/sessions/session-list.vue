<template >
  <div>

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
            <i v-for="({ symbol }) in meetings" :key="symbol">{{symbol}}</i>
          </td>
          <td>
            {{title}}
          </td>
          <td>
            <div class="btn-group" role="group">
              <a class="btn btn-sm btn-outline-dark" :href="getUrl({ _id, meetings })"><i class="fa fa-list"></i></a>
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

export default {
  name       : 'SessionsList',
  props      : { 
                  route:       { type: Object, required: false },
                  tokenReader: { type: Function, required: false }
                },
  methods    : { getUrl, meetingQuery,conferenceQuery, sessionNumber, isInProgress, now },
  computed   : { now },
  filters    : { formatDate: format, tz: timezone },
  created, 
  data
}

function data(){
  return { 
    sessions: [],
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

async function created(){
  this.api = new Api(this.tokenReader);

  const isMeeting = this.route?.params?.meeting;
  const q         = isMeeting? await this.meetingQuery() : await this.conferenceQuery();

  this.sessions  = await this.api.querySessions({ q, s: { date:-1 } });
}

async function meetingQuery(){
  const normalizedSymbol = this.route?.params?.meeting?.toUpperCase() || '';

  if(!normalizedSymbol) return null

  const q        = { normalizedSymbol };
  const meetings = await this.api.queryMeetings({q, f: { _id:1, normalizedSymbol:1 }});

  return { meetingIds : { $in: meetings.map(m=>mapObjectId(m._id)) } };
}

async function conferenceQuery(){
  const code = remapCode(this.route.params.code);

  if(!code) throw new Error('No meeting id or conference code route param for session list')

  const q          = { 'code': code };
  const conference = await this.api.getConference(code);
  const meetingIds = conference.MajorEventIDs.map(remapCode);

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
