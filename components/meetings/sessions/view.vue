
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

import { DateTime                    } from 'luxon'
import { addApiOptions , getSessions } from '../api.js'
import { getMeetingCode              } from '../util'

export default {
  name       : 'SessionsView',
  components : { Session, Accordion },
  props      : { tokenReader: { type: Function, required: false } },
  computed   : { sessionsLength },
  methods    : { header },
  filters    : { timeFilter },
  created, data
}

function data(){
  return { sessions: [] }
}

function sessionsLength(){
  return this.sessions.filter(({interventions})=>interventions.length).length
}

async function created(){
  if(this.tokenReader) addApiOptions({ tokenReader: this.tokenReader })

  this.sessions = await getSessions(getMeetingCode())
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