<template >
  <div>
    <Session :_id="_id" class="card" 
      :body-class="{'collapse':true, 'show': numberOfSessions==1 }" 
      :body-id="`sid${_id}`" 
      v-for="{ title, _id, interventions, date, videos, count, timezone } in sessions" :key="_id">

      <template v-slot:header>

        <div class="card-header" data-toggle="collapse" :data-target="`#sid${_id}`" :class="{ collapsed: numberOfSessions>1 }" >
          <h5 @click="!interventions && loadInterventions(_id)"
           :title="date | setTimezone(timezone) | format('z')"> 
            {{ title }}
            <span v-if="!title" >
              {{ date | setTimezone(timezone) | format('cccc, d MMMM yyyy - T') }}
            </span>
            ({{count}})
            
            <i class="text-muted fa fa-caret-up"/>
            <i class="text-muted fa fa-caret-down"/>
            <i class="text-muted help tiny">click to expand</i>
            <i v-if="!interventions" class="loading text-muted  fa fa-cog fa-spin"></i>
            

            <span class="video" v-if="videos && videos.length">
              <VideoLink class="pull-right" :videos="videos" title="Full session webcast"/>
            </span>

            <br> <small class="text-muted">
              {{ date | setTimezone(timezone) | format('cccc, d MMMM yyyy - T') }}
              <i class="tiny">{{ timezone }}</i>
            </small>
            
          </h5>

        </div>
      </template>

      <InterventionRow v-for="(intervention, index) in interventions" v-bind="{intervention}" :timezone="timezone" :index="index+1" v-bind:key="intervention._id" :public-view="true">
        <template v-slot:controls>
          <div class="video">
            <VideoLink :videos="videos" :start-at="intervention.datetime" :title="`Start at intervention of ${intervention.title}`"/>
          </div>
        </template>
      </InterventionRow>

    </Session>

  </div>
</template>

<script>
import   Api               from '../api.js'
import   Session           from './session.vue'
import   InterventionRow   from './intervention-row.vue'
import   VideoLink         from './video-link.vue'
import { format, timezone as setTimezone } from '../datetime.js'

export default {
  name       : 'SessionsView',
  components : { Session, InterventionRow, VideoLink },
  props      : { 
                  route:       { type: Object, required: false },
                  tokenReader: { type: Function, required: false }
                },
  computed   : { numberOfSessions },
  filters    : { format, setTimezone },
  methods    : { loadInterventions },
  created, data
}

function data(){
  return { 
    sessions: [],
  }
}

async function created(){
  this.api = new Api(this.tokenReader);

  const meetingCode = this.route.params.meeting;
  const meeting     = await this.api.getMeetingByCode(meetingCode)
  const sessions    = await this.api.querySessions({ s: { date: -1 }, q: { 'meetingIds': { $oid: meeting._id }, count: { $gt: 0 } } });

  this.sessions = sessions.map(session => {
    const { date: startDate } = session;
    const videos = (session.videos||[]).map(v=>({ startDate, ...v })) // Set video startDate to session.date if not already set  
    return {
      ...session,
      videos,
      interventions : null, //Make it reactive
    }
  });

  if(sessions.length==1) {
    const [ session ] = sessions; 
    this.loadInterventions(session._id)
  }
}

async function loadInterventions(sessionId){

    const session = this.sessions.find(o=>o._id == sessionId);

    if(!session) return;

    session.interventions = await this.api.queryInterventions({ s: { datetime:  1 }, q: { sessionId : { $oid: sessionId }, status:"public" } });
}

function numberOfSessions(){
  return this.sessions?.length || 0
}
</script>

<style scoped>

  .video ,
  .card-header .video { float: right; color: #404040; }
  .card-header .video { margin-right: -7px; }

  h5 { color: #009b48;}

  .card        { border: none; }
  .card-header { cursor: default; }

  .card-header           .fa-caret-up   { display: none; }
  .card-header.collapsed .fa-caret-up   { display: inline; }

  .card-header           .tiny          { font-weight: lighter; font-size: 80%; }
  .card-header           .help          { display: none; }
  .card-header.collapsed .help          { display: inline; }

  .card-header           .fa-caret-down { display: inline; }
  .card-header.collapsed .fa-caret-down { display: none; }
  .card-header.collapsed .loading       { display: none; }
</style>
