
<template >
  <div>
    <h1>Session Preparation
      <small class="text-muted">
        <span v-for="{normalizedSymbol} in meetings" :key="normalizedSymbol">
          {{normalizedSymbol}}
        </span>
      </small>
    </h1>

    <Session v-if="session" :interventions="session.interventions"/>
    <hr/>

    <EditRow :route="route" :meetings="meetings"/>

    <hr/>
    <Session v-if="pending" :interventions="pending"/>
  </div>
</template>


<script>
import Session                   from './session.vue'
import EditRow                   from './edit-row.vue'
import Api    , { mergeQueries } from '../api.js'

export default {
  name: 'SessionEdit',
  props:{
    route      : { type: Object, required: false },
    tokenReader: { type: Function, required: false }
  },
  components:{ Session, EditRow },
  computed  : { agendaItems },
  methods: {getPending},
  mounted,
  created,
  data,
}

function data(){
  return { 
    interventions: [], 
    meetings : [],
    session: undefined,
    maxResultCount : 250,
    pending: []
  }
}

async function created(){
  this.api = new Api(this.tokenReader);
  
  const meeting = await this.api.getMeetingByCode(this.route.params.meeting);
  
  this.meetings = [meeting];
}

async function mounted(){
  const promises = [
                      this.api.getSessionById(this.route.params.sessionId),
                      this.api.getInterventionsBySessionId(this.route.params.sessionId),
                      this.getPending(this.route.params.sessionId)
                    ]
  const [ session, interventions, pending ] = await Promise.all(promises);

  this.session               = session;
  this.session.interventions = interventions;
  this.pending               = pending;
}

function getPending(id){
  const isPending = { status: 'pending' };
  const hasFiles  = { 'files.0': {$exists: true} }; // has at least one file

  const q = mergeQueries(isPending, hasFiles);
  const l = this.maxResultCount;

  return this.api.queryInterventions({ q, l })
}

function agendaItems() {
  return this.meetings.map(m=>({
    normalizedSymbol : m.normalizedSymbol,
    items : m.agenda.items.map(i=>({ ...i, 
      meetingId: m._id, 
      display:   `${i.item} - ${i.shortTitle}`,
    }))
  }));
}
</script>