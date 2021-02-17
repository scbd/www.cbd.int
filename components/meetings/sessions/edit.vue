
<template >
  <div style="padding-bottom:300px">
    <h1>Session Preparation
      <small class="text-muted">
        <span v-for="{normalizedSymbol} in meetings" :key="normalizedSymbol">
          {{normalizedSymbol}}
        </span>
      </small>
    </h1>

    <!-- <slot v-for="(intervention, index) in interventions" v-bind="{ intervention }">
      <tbody v-bind:key="index" >

      </tbody>
    </slot> -->

    <Session v-if="session" >
      <InterventionRow v-for="(intervention, index) in interventions" v-bind="{intervention, index}" v-bind:key="intervention._id">
        <template slot="controls">
          <button class="btn" @click="editId(intervention._id)"><i class="fa fa-edit"></i></button>
        </template>
      </InterventionRow>
    </Session>

    <hr/>

    <EditRow v-on:penging-query="queryPendingInterventions" v-bind="$props" :meetings="meetings"/>

    <hr/>
    
    <input type="text" @input="onSearch" v-model="freeText">
    <button class="btn" @click="create()"><i class="fa fa-upload"></i></button>

    <caption class="text-nowrap float-right"> <small>{{pendingInterventions.length}} {{$t('Pending statements uploaded')}}</small></caption>
    <Session v-if="pendingInterventions.length" >
      <InterventionRow v-for="intervention in pendingInterventions" v-bind="{intervention}" v-bind:key="intervention._id" @dblclick="edit(intervention)" >
        <template slot="controls">
          <button class="btn" @click="editId(intervention._id)"><i class="fa fa-edit"></i></button>
        </template>
      </InterventionRow>
    </Session>

    <EditInterventionModal v-if="!!editedIntervention"
      :sessionId="sessionId" 
      :intervention="editedIntervention" 
      :agendaItems="agendaItems" 
      :route="route"
      :tokenReader="tokenReader"
      :meetings="meetings"
      @close="editClose"
    ></EditInterventionModal>    
  </div>
</template>


<script>
import { debounce }              from 'lodash'
import EditInterventionModal     from './edit-intervention-modal.vue'
import InterventionRow           from './intervention-row.vue'
import Session                   from './session.vue'
import EditRow                   from './edit-row.vue'
import Api, { mergeQueries, mapObjectId } from '../api.js'

export default {
  name: 'SessionEdit',
  props:{
    route      : { type: Object, required: false },
    tokenReader: { type: Function, required: false }
  },
  components: { Session, EditRow, InterventionRow, EditInterventionModal },
  computed  : { agendaItems },
  methods:    { 
    create, 
    edit, 
    editId, 
    editClose,
    queryPendingInterventions,
    onSearch : debounce(onSearch, 400)
  },
  data,
  created,
  mounted
}

function data(){
  return { 
    session: undefined,
    interventions: [], 
    pendingInterventions: [], 
    meetings : [],
    maxResultCount : 250,
    editedIntervention: null,
    freeText: ''
  }
}

async function created(){
  this.api = new Api(this.tokenReader);
}

async function mounted(){

    const { sessionId, meeting: meetingCode } = this.route.params

    const promises = [
      this.api.getMeetingByCode(meetingCode),
      this.api.getSessionById(sessionId),
      this.api.getInterventionsBySessionId(sessionId),
    ]

    const [ meeting, session, interventions ] = await Promise.all(promises);

    if(!meeting) throw Error("Meeting not found")
    if(!session) throw Error("Session not found")
    if(!session.meetingIds.includes(meeting._id)) throw Error("Meeting & Session do not match")

    this.meetings              = [meeting]
    this.session               = session;
    this.interventions         = interventions;
    this.pendingInterventions  = await this.queryPendingInterventions();
}

async function editId(interventionId){

  const intervention = await this.api.getInterventionById(interventionId)

  this.edit(intervention)
}


function create(){

  this.editedIntervention = { 
    status: 'pending',
    files: [{ language: 'en'} ] };
}

function edit(intervention){
  this.editedIntervention = intervention;
}

function editClose(intervention){
  this.editedIntervention = null

  if(!intervention) return;

  const i  = this.interventions       .findIndex(o=>o._id === intervention._id );
  const pi = this.pendingInterventions.findIndex(o=>o._id === intervention._id );

  if(i>=0)  this.interventions       .splice(i, 1, intervention);
  if(pi>=0) this.pendingInterventions.splice(pi,1, intervention);

  if(pi < 0 && intervention.status=='pending') {
    this.pendingInterventions.splice(0,0, intervention);
  }
}


function onSearch() {
  this.queryPendingInterventions({t : this.freeText});
}

async function queryPendingInterventions(args={}){

  const { t, agendaItem } = args
  const isPending  = { status: 'pending' };
  const hasFiles   = { 'files.0': {$exists: true} }; 
  const meetingIds = { meetingId : { $in: this.meetings.map(m=>mapObjectId(m._id)) } }; 

  const q = mergeQueries(isPending, hasFiles, meetingIds, agendaItem);
  const l = this.maxResultCount;

  this.pendingInterventions = await this.api.queryInterventions({ q, l, t })

  return this.pendingInterventions
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