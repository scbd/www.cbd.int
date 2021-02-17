
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

    <EditRow v-on:penging-query="getPending" v-bind="$props" :meetings="meetings"/>

    <hr/>
    <caption class="text-nowrap float-right"> <small>{{pending.length}} {{$t('Pending statements uploaded')}}</small></caption>
    <Session v-if="pending" :interventions="pending"/>
  </div>
</template>


<script>
import Session                   from './session.vue'
import EditRow                   from './edit-row.vue'
import Api    , { mergeQueries, mapObjectId } from '../api.js'

export default {
  name: 'SessionEdit',
  props:{
    route      : { type: Object, required: false },
    tokenReader: { type: Function, required: false }
  },
  components:{ Session, EditRow },
  computed  : { agendaItems },
  methods: {getPending, loadEventIds},
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
    pending: [],
    eventQuery: '',
    eventQueryMappedObjectId: ''
  }
}

async function created(){
  this.api = new Api(this.tokenReader);
  
  
}

async function mounted(){
  await this.loadEventIds()

  const { sessionId } = this.route.params
  const promises = [
                      this.api.getSessionById(sessionId),
                      this.api.getInterventionsBySessionId(sessionId),
                      this.getPending()//{ theSession: { sessionId } }
                    ]
  const [ session, interventions, pending ] = await Promise.all(promises);

  this.session               = session;
  this.session.interventions = interventions;
  this.pending               = pending;
}

async function getPending(args={}){
  const { $or, theSession, t, government, organizationId  } = args

  const isPending = { status: 'pending' };
  const hasFiles  = { 'files.0': {$exists: true} }; 
  const hasOrg    = organizationId? { organizationId } : ''
  const hasGov    = government?{government:government.toLowerCase()}:''
  const has$or    = $or ? { $or } : ''

  const q = mergeQueries(isPending, hasFiles, theSession, has$or ,hasGov , hasOrg, this.eventQueryMappedObjectId );
  
  const l = this.maxResultCount;

  const eventQuery = t? this.eventQuery: {}

  this.pending = await this.api.queryInterventions({ q, l, t, ...eventQuery })

  return this.pending
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

async function loadEventIds(){
  const { meeting, code } = this.route.params

  const event = code? await this.api.getConference(code) : await this.api.getMeetingByCode(meeting) 


  const { _id } = event

  this.eventQuery               = code? { conferenceId: m_id } : { meetingId: _id }
  this.eventQueryMappedObjectId = code? { conferenceId: mapObjectId(_id) } : { meetingId: mapObjectId(_id) }

  this.meetings = !code? [event] : await this.api.getMeetingById([ ...event.MajorEventIDs, ...event.MinorEventIDs ])

  console.log('this.meetings',this.meetings)
}
</script>