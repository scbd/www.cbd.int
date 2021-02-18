<template >
  <div>
    <Accordion :length="sessions.length">
      <template v-for="({ startDate, title, interventions }, index) in sessions"  v-slot:[`header-${index}`]="">
        <span v-bind:key="index"> {{ header({ title, startDate })}} <small>({{interventions.length}})</small> </span>
      </template>

      <template v-for="({ interventions }, index) in sessions"  v-slot:[`body-${index}`]="" >
        <Session v-bind:key="index">
          <InterventionRow :show-time="false" :show-date="false" v-for="(intervention, index) in interventions" :index="index+1" v-bind="{intervention}" :key="intervention._id"/>
        </Session>
      </template>
    </Accordion >
  </div>
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
  methods    : { header },
  created, data
}

function data(){
  return { 
    sessions: [],
  }
}

async function created(){
  this.api = new Api(this.tokenReader);
  this.sessions = await this.api.getSessions(this.route.params.meeting);
}

function header({title, startDate }){
  return title? title : dateTimeFilter(startDate, 'T  - cccc, d MMMM yyyy')
}
</script>