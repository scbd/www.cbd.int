
<template >
  <div style="padding-bottom:100px">
    <h1>Statements and interventions 
      <small class="text-muted">
        <span v-for="{normalizedSymbol} in meetings" :key="normalizedSymbol">
          {{normalizedSymbol}}
        </span>
      </small>
    </h1>

    <keep-alive>
      <SearchControls v-if="meetings.length" :meetings="meetings" @query="query"/>
    </keep-alive>

    <div class="text-right text-muted">
      <button @click="refresh" class="btn btn-link"><i class="fa fa-refresh"></i></button>
      <i v-if="lastUpdated" class="text-muted"> Last refresh on {{ lastUpdated | dateTimeFilter('T')}} - </i>
      <b v-if="interventions.length>=maxResultCount">More than {{interventions.length}} records </b>
      <b v-if="interventions.length <maxResultCount">{{interventions.length}} records </b>
    </div>

    <div class="card mb-3" v-if="interventions.length">
      <Session>
        <InterventionRow class="interpreter-view" :class="{ 'table-secondary': intervention.files[0].language!=='en' }" v-for="(intervention, index) in interventions" v-bind="{intervention, index}" v-bind:key="intervention._id"/>
      </Session>
    </div>
  
  </div>
</template>

<script>
import { DateTime }    from 'luxon'
import Session         from './session.vue'
import SearchControls  from './search-controls.vue'
import InterventionRow from './intervention-row.vue'
import Api, { mergeQueries } from '../api'

import { dateTimeFilter  } from '../filters.js'
import   Session           from './session.vue'
import   SearchControls    from './search-controls.vue'
import   InterventionRow   from './intervention-row.vue'


export default {
  name      : 'InterpretersView',
  components: { Session, SearchControls, InterventionRow },
  filters   : { dateTimeFilter },
  props     : { 
    route:       { type: Object, required: false },
    tokenReader: { type: Function, required: false } 
  },
  methods: { query, refresh },
  created, 
  mounted, 
  beforeDestroy, 
  data
}

function data(){
  return { 
    interventions: [], 
    meetings : [],
    maxResultCount : 250,
    refreshTimer: null
  }
}

async function created(){
  this.api = new Api(this.tokenReader);

  const meeting = await this.api.getMeetingByCode(this.route.params.meeting);

  this.meetings = [meeting];
}

async function mounted(){
  this.refreshTimer = setInterval(() => this.refresh(), 60 * 1000);
}

function refresh() {
  this.query(this.lastQueryArg);
}

function beforeDestroy(){
  if(this.refreshTimer) clearInterval(this.refreshTimer)
}

function timeFilter (jsDate, format='T')  {
  return jsDate ? DateTime.fromJSDate(jsDate).toFormat(format) : '';
}

async function query(queryArgs){

  this.lastQueryArg = { ...queryArgs }

  const { query, freeText }  = queryArgs;
  const isPending = { status: 'pending' };
  const hasFiles  = { 'files.0': {$exists: true} }; // has at least one file

  const q = mergeQueries(query, isPending, hasFiles);
  const t = freeText;
  const l = this.maxResultCount;
  const s = { score: -1, title: 1, agendaItem: 1, datetime: -1 }

  this.interventions = await this.api.queryInterventions({ q, t, l, s })
  this.lastUpdated   = new Date();
}

</script>

<style scoped>

.summary { 
  max-height:40px;
  overflow:hidden;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  block-overflow: ellipsis;
  max-lines: 2;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;  
}
</style>

<style>
tr.interpreter-view > td > .title {
  font-weight: bold;
}
</style>