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
          <th scope="col">Title</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="({ _id, date, title }, index) in sessions" :key="_id">
          <th scope="row">{{index+1}}</th>
          <td>{{ date | dateTimeFilter('cccc, d MMMM yyyy - T') }}</td>
          <td>{{title}}</td>
          <td>
            <div class="btn-group" role="group">
              <a class="btn btn-sm btn-outline-dark" :href="getUrl(_id)"><i class="fa fa-list"></i></a>
            </div>
            
          </td>
        </tr>
      </tbody>
    </table>
    
  </div>
</template>

<script>

import   Api, {mapObjectId}from '../api.js'
import { dateTimeFilter  } from '../filters.js'

export default {
  name       : 'SessionsList',
  props      : { 
                  route:       { type: Object, required: false },
                  tokenReader: { type: Function, required: false }
                },
  filters    : { dateTimeFilter },
  created, 
  data,
  methods: { getUrl} 
}

function data(){
  return { 
    sessions: [],
    meetings: []
  }
}

function getUrl(id) {
  return `/meetings/${encodeURIComponent(this.route.params.meeting)}/sessions/${encodeURIComponent(id)}/manage`
}

async function created(){
  this.api = new Api(this.tokenReader);

  let q = { normalizedSymbol: this.route.params.meeting.toUpperCase() };
  const meetings = await this.api.queryMeetings({q, f: { _id:1, normalizedSymbol:1 }});

  q = { meetingIds : { $in: meetings.map(m=>mapObjectId(m._id)) } };
  const sessions = await this.api.querySessions({q, s: { date:-1 }});

  this.meetings = meetings;
  this.sessions = sessions;
}
</script>