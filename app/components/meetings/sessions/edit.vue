
<template >
  <div class="position-relative">
    <h1>Session Preparation
      <small class="text-muted">
        <span v-for="{normalizedSymbol} in meetings" :key="normalizedSymbol">
          {{normalizedSymbol}}
        </span>
      </small>
    </h1>

    <h3  v-if="session" :class="{ 'bg-warning text-dark p-1': isInPast(session), 'bg-danger text-white p-1': isInFuture(session) }" class="position-sticky sticky-date"> 
                  {{ (session || {}).date | timezone(session.timezone) | formatDate('d MMMM yyyy (cccc) T') }}
        <small><i>{{ (session || {}).date | timezone(session.timezone) | formatDate('(z)') }}</i></small>
    </h3>

    <Session v-if="session">
      <InterventionRow v-for="(intervention, index) in interventions" :index="index+1" v-bind="{intervention}" :timezone="session.timezone" v-bind:key="intervention._id">
        <template slot="controls">
          <TagSelector :selectedTags="intervention.tags" @tag="toggleTag(intervention, $event)"/>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-dark" @click="editId(intervention._id, 'edit')"><i class="fa fa-edit"></i></button>
            <button class="btn btn-sm btn-outline-danger" @click="askDelete(intervention)"><i class="fa fa-trash"></i></button>
          </div>
        </template>
      </InterventionRow>
    </Session>

    <hr/>

    <EditRow v-if="session || pendingInterventions.length" v-on:penging-query="queryPendingInterventions" v-bind="$props" :timezone="session.timezone" :meetings="meetings" @new-intervention="init">
      <template slot="controls">
        <button class="btn" @click="createPendingIntervention()"><i class="fa fa-upload"></i></button>
      </template>
    </EditRow>

    <hr/>

    <caption class="text-nowrap float-right">
      <small>{{pendingInterventions.length}} {{$t('Pending statements uploaded')}}</small>
    </caption>
    <Session v-if="pendingInterventions.length" >
      <InterventionRow v-for="intervention in pendingInterventions" v-bind="{intervention}" :timezone="session.timezone" v-bind:key="intervention._id" @dblclick="edit(intervention)" >
        <template slot="controls">
          <div class="text-nowrap">
            <TagSelector :selectedTags="intervention.tags" @tag="toggleTag(intervention, $event)"/>
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
      :timezone="session.timezone" 
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
import { format as formatDate, timezone }                 from '../datetime.js'
import   EditInterventionModal              from './edit-intervention-modal.vue'
import   InterventionRow                    from './intervention-row.vue'
import   Session                            from './session.vue'
import   EditRow                            from './edit-row.vue'
import   TagSelector                        from './tag-selector.vue'
import   moment                             from 'moment'
import   remapCode                          from './re-map.js'
import remap from './re-map.js'

export default {
  name      : 'SessionEdit',
  props     : {
                route      : { type: Object,   required: false },
                tokenReader: { type: Function, required: false }
              },
  components: { Session, EditRow, InterventionRow, EditInterventionModal, TagSelector },
  computed  : { 
                agendaItems, 
                sessionId() { return this.session._id } 
              },
  filters   : { formatDate, timezone },
  methods   : {
                init,
                createPendingIntervention, 
                edit, 
                editId, 
                editClose,
                askDelete,
                replace,
                toggleTag,
                queryPendingInterventions,
                onSearch : debounce(onSearch, 400),
                isInPast, 
                isInFuture
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
    const { sessionId, code: conferenceCode } = this.route.params;
    const meetingCode = remapCode(this.route.params.meeting);

    const promises = [
      this.api.getSessionById(sessionId),
      this.api.getInterventionsBySessionId(sessionId, { s:{datetime:1}})
    ];

    if(meetingCode) {
      promises.push(this.api.getMeetingByCode(meetingCode))
    }

    const [ session, interventions, meeting ] = await Promise.all(promises);

    if(!session) throw Error("Session not found");
    if(meeting && !session.meetingIds.includes(meeting._id)) throw Error("Meeting & Session do not match");
    
    if(meeting) {
      this.meetings = [ meeting ];
    }
    else {
      const meetingIds = _(session.meetingIds).map(remapCode).uniq().value();
      const meetings   = await Promise.all(meetingIds.map(id=>this.api.getMeetingById(id)));

      this.meetings = meetings.filter(o=>!!o.agenda);
    }

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

  // Only re-add if intervention exists and belongs to this session
  const belongsToThisSession = intervention && intervention.sessionId === this.sessionId;

  if(intervention && belongsToThisSession) {
    if( i>=0 && intervention.status=='pending')  i=-1;
    if(pi>=0 && intervention.status=='public' ) pi=-1;

    if( i>=0) this.interventions       .splice( i, 0, intervention);
    if(pi>=0) this.pendingInterventions.splice(pi, 0, intervention);

    if( i < 0 && intervention.status=='public')  this.interventions       .push(intervention);
    if(pi < 0 && intervention.status=='pending') this.pendingInterventions.unshift(intervention);
  }

  this.interventions = sortBy(this.interventions, o=>o.datetime);
}

async function toggleTag(intervention, tag) {

  let tags = intervention.tags || [];

  tags = !tags.includes(tag)
       ? await this.api.addInterventionTag   (intervention._id, tag)
       : await this.api.deleteInterventionTag(intervention._id, tag);

  intervention.tags = tags;
}

function onSearch() {
  this.queryPendingInterventions({t : this.freeText});
}

async function queryPendingInterventions(args={}){
  if(!this.meetings.length) return []

  const { t, agendaItem } = args;
  const   isPending       = { status: 'pending' };
  const   hasFiles        = { 'files.0': {$exists: true} }; 
  const   meetingIds      = { meetingId : { $in: this.meetings.map(m=>mapObjectId(m._id)) } }; 
  const   q               = mergeQueries(isPending, hasFiles, meetingIds, agendaItem);
  const   l               = this.maxResultCount;

  const textSearch = t? { t } : {};
  
  this.pendingInterventions = await this.api.queryInterventions({ q, l, ...textSearch  });

  return this.pendingInterventions;
}

function agendaItems() {
  return this.meetings.map(m=>{
    const prefix = withPrefix ? (m.agenda.prefix||'') : '';
    return {
      normalizedSymbol : m.normalizedSymbol,
      items : m.agenda.items.map(i=>({ ...i, 
        meetingId: m._id, 
        display:   `${prefix} ${i.item} - ${i.shortTitle || i.title}`.trim(),
      }))
    };
  });
}
function isInPast({ date } ={}){
  if(!date) return false

  return moment().isAfter(moment(date).add(8, 'hours'))
}

function isInFuture({ date } ={}){
  if(!date) return false

  return moment().isBefore(moment(date).subtract(8, 'hours'))
}

</script>
<style scoped>
  .sticky-date { top: 5px; background-color: white; z-index: 1 }
  @media screen and (max-width: 768px) {
    .sticky-date { top: 30px; }
  }
</style>