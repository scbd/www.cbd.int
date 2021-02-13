
<template >
  <Accordion :length="sessionsLength">
    <template v-for="({ startDate, title}, index) in sessions.filter(({interventions})=>interventions.length)"  v-slot:[`header-${index}`]="">
      {{ header({ title, startDate })}}
    </template>

    <template v-for="({ interventions }, index) in sessions.filter(({interventions})=>interventions.length)"  v-slot:[`body-${index}`]="" >
      <Session  :interventions="interventions" v-bind:key="index"/>
    </template>
  </Accordion >
</template>

<script>
import Session   from './session.vue'
import Accordion from './accordion.vue'

import { DateTime } from 'luxon'
import Api from '../api.js'

export default {
  name       : 'SessionsView',
  components : { Session, Accordion },
  props      : { 
    route:       { type: Object, required: false },
    tokenReader: { type: Function, required: false } },
  computed   : { sessionsLength },
  methods    : { header },
  filters    : { timeFilter },
  created, data
}

function data(){
  return { sessions: [], _api : null }
}

function sessionsLength(){
  return this.sessions.filter(({interventions})=>interventions.length).length
}

async function created(){
  this.api      = new Api(this.tokenReader);
  this.sessions = await this.api.getSessions(this.route.params.meeting)
}

function timeFilter (isoDateString)  {
  return DateTime.fromISO(isoDateString).toFormat('T')
}

function dateTimeFilter (isoDateString) {
  return DateTime.fromISO(isoDateString).toFormat('T  - cccc, d MMMM yyyy')
}

function header({title, startDate }){
  return title? title : dateTimeFilter(startDate)
}
</script>