
<template >
  <div>
    <h1>Session Preparation
      <small class="text-muted">
        <span v-for="{normalizedSymbol} in meetings" :key="normalizedSymbol">
          {{normalizedSymbol}}
        </span>
      </small>
    </h1>

    <h3> {{ (session || {}).date  | dateTimeFilter('T  - cccc, d MMMM yyyy') }} </h3>

    <Session v-if="session">
      <InterventionRow v-for="(intervention, index) in interventions" :index="index+1" v-bind="{intervention}" v-bind:key="intervention._id">
        <template slot="controls">
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-dark" @click="editId(intervention._id, 'edit')"><i class="fa fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" @click="askDelete(intervention)"><i class="fa fa-trash"></i></button>
          </div>
        </template>
      </InterventionRow>
    </Session>

    <hr/>

    <EditRow v-if="session || pendingInterventions.length" v-on:penging-query="queryPendingInterventions" v-bind="$props" :meetings="meetings" @new-intervention="init">
      <template slot="controls">
        <button class="btn" @click="createPendingIntervention()"><i class="fa fa-upload"></i></button>
      </template>
    </EditRow>

    <hr/>

    <caption class="text-nowrap float-right">
      <small>{{pendingInterventions.length}} {{$t('Pending statements uploaded')}}</small>
    </caption>
    <Session v-if="pendingInterventions.length" >
      <InterventionRow v-for="intervention in pendingInterventions" v-bind="{intervention}" v-bind:key="intervention._id" @dblclick="edit(intervention)" >
        <template slot="controls">
          <div class="text-nowrap">
            <button class="btn btn-sm btn-outline-success" @click="editId(intervention._id, 'publish')"><i class="fa fa-microphone"></i></button>

            <div class="btn-group" role="group">
              <button class="btn btn-sm btn-outline-dark"    @click="editId(intervention._id)"><i class="fa fa-edit"></i></button>
              <button class="btn btn-sm btn-outline-danger"  @click="askDelete(intervention)"><i class="fa fa-trash"></i></button>
            </div>
          </div>
        </template>
      </InterventionRow>
    </Session>

    <EditInterventionModal v-if="!!editedIntervention"
      :sessionId="sessionId" 
      :intervention="editedIntervention" 
      :action="editAction"
      :route="route"
      :tokenReader="tokenReader"
      :meetings="meetings"
      @close="editClose"
    ></EditInterventionModal>
  </div>
</template>

<script>
import Api, { mergeQueries, mapObjectId } from '../api.js'

import { sortBy                , debounce } from 'lodash'
import { dateTimeFilter        }            from '../filters.js'
import   EditInterventionModal              from './edit-intervention-modal.vue'
import   InterventionRow                    from './intervention-row.vue'
import   Session                            from './session.vue'
import   EditRow                            from './edit-row.vue'

export default {
  name      : 'SessionEdit',
  props     : {
                route      : { type: Object,   required: false },
                tokenReader: { type: Function, required: false }
              },
  components: { Session, EditRow, InterventionRow, EditInterventionModal },
  computed  : { 
                agendaItems, 
                sessionId() { return this.session._id } 
              },
  filters   : { dateTimeFilter },
  methods   : {
                init,
                createPendingIntervention, 
                edit, 
                editId, 
                editClose,
                askDelete,
                replace,
                queryPendingInterventions,
                onSearch : debounce(onSearch, 400)
              },
  data, created, mounted
}

function data(){
  return { 
    session             : undefined,
    interventions       : [],
    pendingInterventions: [],
    meetings            : [],
    maxResultCount      : 250,
    editedIntervention  : null,
    editAction          : null,
    freeText            : ''
  }
}

async function created(){
  this.api = new Api(this.tokenReader);
}

function mounted(){
  this.init()
}

async function init(){
    const { sessionId, meeting: meetingCode } = this.route.params

    const promises = [
      this.api.getMeetingByCode(meetingCode),
      this.api.getSessionById(sessionId),
      this.api.getInterventionsBySessionId(sessionId, { s:{datetime:1}}),
    ]

    const [ meeting, session, interventions ] = await Promise.all(promises);

    if(!meeting) throw Error("Meeting not found");
    if(!session) throw Error("Session not found");
    if(!session.meetingIds.includes(meeting._id)) throw Error("Meeting & Session do not match");

    this.meetings              = [ meeting ];
    this.session               = session;
    this.interventions         = interventions;
    this.pendingInterventions  = await this.queryPendingInterventions();
}

function createPendingIntervention(){
  this.edit({ 
    status: 'pending',
    files : [ { language: 'en', allowPublic: false} ]
  });
}

async function editId(interventionId, editAction){
  const intervention = await this.api.getInterventionById(interventionId)

  this.edit(intervention, editAction)
}

function edit(intervention, editAction){

  this.editAction = editAction;
  this.editedIntervention = intervention;
}

function editClose(intervention){
  this.editAction = null
  this.editedIntervention = null

  if(!intervention) return

  const { _id } = intervention;

  this.replace(_id, intervention);
}

async function askDelete(intervention){

  if(!confirm(`Delete "${intervention.title}?`)) return;

  const { _id } = intervention;

  await this.api.deleteIntervention(_id);

  this.replace(_id, null);
}



function replace(_id, intervention) {
  let  i = this.interventions       .findIndex(o=>o._id === _id );
  let pi = this.pendingInterventions.findIndex(o=>o._id === _id );

  if( i>=0) this.interventions       .splice( i, 1);
  if(pi>=0) this.pendingInterventions.splice(pi, 1);

  if(intervention) {
    if( i>=0 && intervention.status=='pending')  i=-1;
    if(pi>=0 && intervention.status=='public' ) pi=-1;

    if( i>=0) this.interventions       .splice( i, 0, intervention);
    if(pi>=0) this.pendingInterventions.splice(pi, 0, intervention);

    if( i < 0 && intervention.status=='public')  this.interventions       .push(intervention);
    if(pi < 0 && intervention.status=='pending') this.pendingInterventions.unshift(intervention);
  }

  this.interventions = sortBy(this.interventions, o=>o.datetime);
}

function onSearch() {
  this.queryPendingInterventions({t : this.freeText});
}

async function queryPendingInterventions(args={}){
  if(!this.meetings[0]) return []

  const { t, agendaItem } = args;
  const   isPending       = { status: 'pending' };
  const   hasFiles        = { 'files.0': {$exists: true} }; 
  const   meetingIds      = { meetingId : { $in: this.meetings.map(m=>mapObjectId(m._id)) } }; 
  const   meetingId       = this.meetings[0]._id;
  const   q               = mergeQueries(isPending, hasFiles, meetingIds, agendaItem);
  const   l               = this.maxResultCount;

  const textSearch = t? { t, meetingId } : {};
  
  this.pendingInterventions = await this.api.queryInterventions({ q, l, ...textSearch  });

  return this.pendingInterventions;
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