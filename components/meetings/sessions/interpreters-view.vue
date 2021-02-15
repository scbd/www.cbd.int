
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
      <span v-if="interventions.length>=maxResultCount">More than {{interventions.length}} records </span>
      <span v-if="interventions.length <maxResultCount">{{interventions.length}} records </span>
    </div>

    <div class="card mb-3" v-if="interventions.length">
      <Session :interventions="interventions"  :show-status="true"/>
    </div>
   
  </div>
</template>

<script>
import Session         from './session.vue'
import SearchControls  from './search-controls.vue'
import Api, { mergeQueries } from '../api'

export default {
  name      : 'InterpretersView',
  components: { Session, SearchControls },
  props     : { 
    route:       { type: Object, required: false },
    tokenReader: { type: Function, required: false } 
  },
  methods:{query},
  created, 
  data
}

function data(){
  return { 
    interventions: [], 
    meetings : [],
    maxResultCount : 250,
    }
}

async function created(){
  this.api = new Api(this.tokenReader);

  const meeting = await this.api.getMeetingByCode(this.route.params.meeting);
  
  this.meetings = [meeting];
}

async function query(queryArgs){

  const { query, freeText }  = queryArgs;
  const isPending = { status: 'pending' };
  const hasFiles  = { 'files.0': {$exists: true} }; // has at least one file

  const q = mergeQueries(query, isPending, hasFiles);
  const t = freeText;
  const l = this.maxResultCount;

  this.interventions = await this.api.queryInterventions({ q, t, l })
}

</script>