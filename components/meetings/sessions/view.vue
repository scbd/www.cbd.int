
<template >
  <div>
    <Accordion :length="sessionsLength">

      <template v-for="({ startDate, title}, index) in sessions"  v-slot:[`header-${index}`]="">
        {{startDate | dateTimeFilter }} - {{ title.en }}
      </template>

      <template v-for="({ statements }, index) in sessions"  v-slot:[`body-${index}`]="" >
        <table class="table table-striped table-hover no-border-first-row sessions" v-bind:key="index">
          <tbody>
            <tr v-for="({ agendaItems, time, organization, public: publicVisible }, index) in statements" v-bind:key="index">

              <th scope="row" class="index-col d-none d-md-table-cell" style="text-align: center; vertical-align: middle;">{{index+1}}.</th>

              <td class="agenda-items-col" style="text-align: center; vertical-align: middle;">
                <AgendaItem v-for="(item, index) in agendaItems" v-bind:key="index" v-bind="item"/>
              </td>

              <td class="time-col" style="text-align: center; vertical-align: middle;">{{ time | timeFilter }}</td>

              <td style="vertical-align: middle;">{{ organization.title }} <span>{{ organization.type }}</span> </td>

              <td class="files-col" style="text-align: center; vertical-align: middle;">

              </td>
              <td class="d-none d-md-table-cell files-col" style="text-align: center; vertical-align: middle;"> 
                <i v-if="publicVisible" class="fa fa-eye-slash" style="font-size:1.25em"/> 
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
import i18n       from '../locales.js'

import { DateTime } from 'luxon'
import { getSessions } from '../api.js'
import { isConference, isMeeting, getMeetingCode } from '../util'


export default {
  name: 'SessionsView',
  props:{
    token: { type: String, required: false },
    user: { type: Object, required: false },
  },
  components:{ Accordion, AgendaItem },
  computed:{ sessionsLength },
  filters: { timeFilter, dateTimeFilter },
  i18n,
  mounted,
  data
}

function data(){
  return { sessions: [] }
}

function sessionsLength(){
  return this.sessions.length
}

async function mounted(){

  this.sessions = await getSessions()

  console.log('isConference'  , isConference  ())
  console.log('isMeeting'     , isMeeting     ())
  console.log('getMeetingCode', getMeetingCode())
}

function timeFilter (isoDateString)  {
  return DateTime.fromISO(isoDateString).toFormat('T')
}

function dateTimeFilter (isoDateString) {
  return DateTime.fromISO(isoDateString).toFormat('T  - cccc, d MMMM yyyy')
}

</script>

<style scoped>
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
  width:65px;
  text-align: center;
  vertical-align: middle;
}

.time-col{
  width:65px;
  text-align: center;
}
</style>