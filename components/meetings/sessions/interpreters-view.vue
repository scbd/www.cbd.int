
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
      <i v-if="lastUpdated" class="text-muted"> Last refresh on {{ lastUpdated | timeFilter('T')}} - </i>
      <b v-if="interventions.length>=maxResultCount">More than {{interventions.length}} records </b>
      <b v-if="interventions.length <maxResultCount">{{interventions.length}} records </b>
    </div>

    <div class="card mb-3" v-if="interventions.length">
      <Session :interventions="interventions"  :show-status="true"/>
    </div>
   
  </div>
</template>

<script>
import { DateTime }    from 'luxon'
import Session         from './session.vue'
import SearchControls  from './search-controls.vue'
import Api, { mergeQueries } from '../api'

export default {
  name      : 'InterpretersView',
  components: { Session, SearchControls },
  filters   : { timeFilter },
  props     : { 
    route:       { type: Object, required: false },
    tokenReader: { type: Function, required: false } 
  },
  methods: { query },
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
  this.refreshTimer = setInterval(() => this.query(this.lastQueryArg), 60 * 1000);
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