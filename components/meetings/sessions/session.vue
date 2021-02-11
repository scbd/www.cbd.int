
<template >
  <table v-if="getRows().length" class="table table-striped table-hover no-border-first-row sessions" v-bind:key="index">
    <tbody v-for="(interventions, i) in getRows()" v-bind:key="i">
      <tr v-for="({ agendaItem, datetime, title, organizationType, status, files }, index) in interventions" v-bind:key="index">

        <th scope="row" class="index-col d-none d-md-table-cell" style="text-align: center; vertical-align: middle;">
          <span v-if="!isPending(status)">{{index+1}}.</span>
        </th>

        <td class="agenda-items-col" style="text-align: center; vertical-align: middle;">
          <AgendaItem  :item="agendaItem"/>
        </td>

        <td v-if="showStatus" class="status-col" style="text-align: center; vertical-align: middle;">
          <span v-if="!isPending(status)">{{ datetime | timeFilter('EEE, MMM d') }}</span>
          <small v-if="isPending(status)" class="text-muted lighter">{{$t('Pending')}}...</small>
        </td>

        <td class="time-col" style="text-align: center; vertical-align: middle;">
          <span v-if="!isPending(status)">{{ datetime | timeFilter('T') }}</span>
          <small v-if="isPending(status) && !showStatus" class="text-muted lighter">{{$t('Pending')}}...</small>
        </td>

        <td style="vertical-align: middle;">{{ title }}<span class="float-right type">{{getOrgType({ organizationType }) }}</span> </td>

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


<script>
import   AgendaItem   from './agenda-item.vue'
import   FilesView    from './files-view.vue'
import   i18n         from '../locales.js'
import { DateTime   } from 'luxon'

export default {
  name      : 'SessionsView',
  components: { AgendaItem, FilesView },
  props     : { 
                interventions: { type: Array,   required: false },
                showStatus   : { type: Boolean, required: false, default: false },
              },
  methods   : { getOrgType, pendingOrDate, getRows, isPending },
  filters   : { timeFilter },
  i18n
}

function timeFilter (isoDateString, format='T')  {
  return DateTime.fromISO(isoDateString).toFormat(format)
}

function getOrgType({ organizationType }){
  return isPlainObject(organizationType)? organizationType.acronym : organizationType
}

function isPlainObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]' && o?.constructor?.name === 'Object';
}

function pendingOrDate({ status, datetime }){
  return this.isPending(status)? 'penging...' : timeFilter(datetime, 'EEE, MMM d')
}

function isPending (status){
  return status === 'pending'
}

function getRows(){
  if(!this.interventions.length) return []

  if(Array.isArray(this.interventions[0])) return this.interventions

  return[ this.interventions ]
}
</script>

<style scoped>
.type{
  font-weight: lighter;
  text-transform: uppercase;
}
.lighter{
  font-weight: light;
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
  width:70px;
  text-align: center;
}
.status-col{
  width:90px;
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