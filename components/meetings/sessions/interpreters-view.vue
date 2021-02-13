
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

    <div class="card mb-3" v-if="interventions.length">
      <Session :interventions="interventions"  :show-status="true"/>
    </div>
    {{interventions.length}} records
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
  return { interventions: [], meetings : [] }
}

async function created(){
  this.api = new Api(this.tokenReader);

  const meeting = await this.api.getMeetingByCode(this.route.params.meeting);
  
  this.meetings = [meeting];
}

async function query(queryArgs){

  const { query, freeText }  = queryArgs;
  const status = { status: 'pending' };

  const q = mergeQueries(query, status);
  const t = freeText;

  this.interventions = await this.api.queryInterventions({ q, t, l:50 })
}

</script>