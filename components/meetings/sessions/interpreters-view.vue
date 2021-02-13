
<template >
  <div>
    <h1>Interpreters View</h1>
    <keep-alive>
    <SearchControls v-if="agendaItems.length" :agenda-items="agendaItems" :dates="dates" @query="query"/>
    </keep-alive>
    <div v-bind:key="index" v-for="(interventions, index) in sessionGroups" class="card mb-3">
      <Session  :interventions="interventions"  :show-status="true"/>
    </div>
  </div>
</template>


<script>
import Session        from './session.vue'
import SearchControls from './search-controls.vue'

import { addApiOptions  , getInterventions, getAgendaItems, getDatesByMeeting } from '../api.js'
import { getMeetingCode ,                    } from '../util'

export default {
  name      : 'InterpretersView',
  components: { Session, SearchControls },
  props     : { tokenReader: { type: Function, required: false } },
  methods:{query},
  created, data
}

function data(){
  return { sessionGroups: [], agendaItems: [], dates: [] }
}

async function created(){
  if(this.tokenReader) addApiOptions({ tokenReader: this.tokenReader })

  this.sessionGroups = await getInterventions(getMeetingCode())

  this.agendaItems = await getAgendaItems(getMeetingCode())

  this.dates = await getDatesByMeeting(getMeetingCode())

}

async function query(qArgs){
  console.log(qArgs)
  this.sessionGroups = await getInterventions(...qArgs)
}

</script>