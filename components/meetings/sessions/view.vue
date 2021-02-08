
<template >
  <div >
    <Accordion :length="sessionsLength">

      <template v-for="({ startDate, title}, index) in sessions"  v-slot:[`header-${index}`]="">
        {{ header({ title, startDate })}}
      </template>

      <template v-for="({ interventions }, index) in sessions"  v-slot:[`body-${index}`]="" >
        <table class="table table-striped table-hover no-border-first-row sessions" v-bind:key="index">
          <tbody>
            <tr v-for="({ agendaItem, datetime, title, organizationType, status, files }, index) in interventions" v-bind:key="index">

              <th scope="row" class="index-col d-none d-md-table-cell" style="text-align: center; vertical-align: middle;">{{index+1}}.</th>

              <td class="agenda-items-col" style="text-align: center; vertical-align: middle;">
                <AgendaItem  :item="agendaItem"/>
              </td>

              <td class="time-col" style="text-align: center; vertical-align: middle;">{{ datetime | timeFilter }}</td>

              <td style="vertical-align: middle;">{{title}}<span class="float-right type">{{organizationType}}</span> </td>

              <td class="files-col" style="text-align: center; vertical-align: middle;">
                <FilesView :files="files"/>
              </td>
              <td class="d-none d-md-table-cell private-col" style="text-align: center; vertical-align: middle;">
                <i v-if="status==='hidden'" class="fa fa-eye-slash" style="font-size:1.25em"/>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

    </Accordion >
  </div>
</template>


<script>
import Accordion  from './accordion.vue'
import AgendaItem from './agenda-item.vue'
import FilesView  from './files-view.vue'
import i18n       from '../locales.js'

import { DateTime                    } from 'luxon'
import { addApiOptions , getSessions } from '../api.js'
import { getMeetingCode              } from '../util'


export default {
  name: 'SessionsView',
  props:{
    tokenReader: { type: Function, required: false },
  },
  components:{ Accordion, AgendaItem, FilesView},
  computed:{ sessionsLength },
  methods: { header },
  filters: { timeFilter },
  i18n,
  mounted,
  data,
  watch: { 
    tokenReader: function(tokenReader) {  
      if(tokenReader) addApiOptions({ tokenReader }) 
    }
  }
}

function data(){
  return { sessions: [] }
}

function sessionsLength(){
  return this.sessions.length
}

async function mounted(){

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

<style scoped>
.type{
  font-weight: lighter;
  text-transform: uppercase;
}
table.sessions {
  table-layout: fixed;
  width: 100%;
}
.index-col{
  width: 2em;
  max-width: 3em;
  text-align: center;
}


.agenda-items-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}


.files-col{
  width:340px;
  text-align: center;
  vertical-align: middle;
}
.private-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}
.time-col{
  width:65px;
  text-align: center;
}

@media screen and (max-width: 768px) {
  .files-col{
    width:65px;
    text-align: center;
    vertical-align: middle;
  }
}
</style>