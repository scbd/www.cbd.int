
<template >
  <Accordion :length="sessionsLength">
    
    <template v-for="({ startDate, title}, index) in sessions.filter(({interventions})=>interventions.length)"  v-slot:[`header-${index}`]="">
      {{ header({ title, startDate })}}
    </template>

    <template v-for="({ interventions }, index) in sessions.filter(({interventions})=>interventions.length)"  v-slot:[`body-${index}`]="" >
      <Session v-if="interventions" :interventions="interventions" v-bind:key="index">
        <InterventionRow v-for="(intervention, index) in interventions" :index="index+1" v-bind="{intervention}" v-bind:key="intervention._id"/>
      </Session>
    </template>

  </Accordion >
</template>

<script>
import   Api               from '../api.js'
import   InterventionRow   from './intervention-row.vue'
import   Session           from './session.vue'
import   Accordion         from './accordion.vue'
import { dateTimeFilter  } from '../filters.js'

export default {
  name       : 'SessionsView',
  components : { Session, Accordion, InterventionRow },
  props      : { 
                  route:       { type: Object, required: false },
                  tokenReader: { type: Function, required: false }
                },
  computed   : { sessionsLength },
  methods    : { header },
  created, data
}

function data(){
  return { sessions: [], api : null }
}

function sessionsLength(){
  return this.sessions.filter(({interventions})=>interventions.length).length
}

async function created(){
  this.api      = new Api(this.tokenReader);
  this.sessions = await this.api.getSessions(this.route.params.meeting)
}

function header({title, startDate }){
  return title? title : dateTimeFilter(startDate, 'T  - cccc, d MMMM yyyy')
}
</script>