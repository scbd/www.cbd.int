
<template >
  <div>
    <h1>Interpreters View</h1>
    <SearchControls/>
    <div v-bind:key="index" v-for="(interventions, index) in sessionGroups" class="card mb-3">
      <Session  :interventions="interventions" :show-status="true"/>
    </div>
    <pre>
      {{interventions}}
    </pre>
  </div>
</template>


<script>
import Session        from './session.vue'
import SearchControls from './search-controls.vue'

import { addApiOptions  , getInterventions } from '../api.js'
import { getMeetingCode ,                    } from '../util'

export default {
  name      : 'InterpretersView',
  components: { Session, SearchControls },
  props     : { tokenReader: { type: Function, required: false } },
  created, data
}

function data(){
  return { sessionGroups: [] }
}

async function created(){
  if(this.tokenReader) addApiOptions({ tokenReader: this.tokenReader })

  this.sessionGroups = await getInterventions(getMeetingCode())

}


</script>