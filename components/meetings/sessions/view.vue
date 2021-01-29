
<template >
  <div>

    <Accordion :length="sessionsLength">

      <template v-for="(session, index) in sessions"  v-slot:[`header-${index}`]="">
        Date {{index}} 
      </template>

      <template v-for="(session, index) in sessions"  v-slot:[`body-${index}`]="">
        <table class="table table-striped table-hover no-border-first-row sessions">
          <!-- <col id="index-col" class="index-col d-none d-md-table-cell"/> -->
          <!-- <col id="agenda-items-col" class="agenda-items-col"/>
          <col id="time-col" class="time-col"/>
          <col id="organization-col" /> -->
          <!-- <col id="files-col" class="files-col"/>
          <col id="permissions-col" class="d-none d-md-table-cell"/> -->
          <tbody>
            <tr>
              <th scope="row" class="index-col d-none d-md-table-cell">1.</th>
              <td class="agenda-items-col"><span class="badge label agenda NP">NP 16</span></td>
              <td class="time-col">{{ session.startDate | timeFilter }}</td>
              <td >Canada</td>
              <td class="files-col">
                <button type="button" class="btn btn-default btn-lg dropdown-toggle">
                  <i class="fa fa-arrow-circle-down" style="font-size:1.25em"></i>
                </button>
              </td>
              <td class="files-col d-none d-md-table-cell ">Not Public</td>
            </tr>
          </tbody>
        </table>
      </template>

    </Accordion >
  </div>
</template>


<script>
 import { DateTime } from 'luxon'
import Accordion from './accordion.vue'
import { getSessions } from '../api.js'
import { isConference, isMeeting, getMeetingCode } from '../util'
import   i18n                                      from '../locales.js'

export default {
  name: 'SessionsView',
  components:{ Accordion },
  computed:{ sessionsLength },
  filters: { timeFilter },
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

table.sessions > tbody > tr > td {
  border: 1px solid red;
}
/*  */

.label.agenda.CBD {
    color: #fff;
    background: #009B48;
}

.label.agenda.CBD {
    color: #fff;
    background: #009B48;
}
.label.agenda.CP {
    color: #fff;
    background: #A05800;
}

.label.agenda.CP {
    color: #fff;
    background: #A05800;
}
.label.agenda.NP {
    color: #fff;
    background: #0086B7;
}
.label.agenda.NP {
    color: #fff;
    background: #0086B7;
}
.label.agenda {
    color: #fff;
    background: #777;
    display: inline-block;
    min-width: 55px;
}
.label.agenda {
    color: #fff;
    background: #777;
    display: inline-block;
    min-width: 55px;
}
.badge {
    display: inline-block;
    padding: .25em .4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25rem;
}
</style>