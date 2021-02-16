
<template >
  <table v-if="getRows().length" class="table table-striped table-hover no-border-first-row sessions" v-bind:key="index">
    <tbody v-for="(interventions, i) in getRows()" v-bind:key="i">
      <tr v-for="({ agenda, agendaItem, datetime, title, organizationType, status, files }, index) in interventions" v-bind:key="index">

        <td scope="row" class="index-col d-none d-md-table-cell" style="text-align: center; vertical-align: middle;">
          <span  v-if="!isPending(status)">{{index+1}}.</span>
          <small v-if="isPending(status)" class="text-muted lighter">{{$t('Pending')}}</small>
        </td>

        <td class="agenda-items-col" style="text-align: center; vertical-align: middle;">
          <AgendaItem :item="agenda || ( agendaItem && { item: agendaItem})"/>
        </td>

        <td v-if="showStatus" class="date-col" style="text-align: center; vertical-align: middle;">
          <span>{{ datetime | timeFilter('MMM d') }}</span>
        </td>

        <td class="time-col" style="text-align: center; vertical-align: middle;">
          <span>{{ datetime | timeFilter('T') }}</span>
        </td>

        <td style="vertical-align: middle;"> 
          <span class="float-right text-muted">{{getOrgType({ organizationType }) }} </span>  
          {{ title }}
          <div class="text-muted small" style="max-height:45px;overflow:hidden">{{summary || files[0].text}}</div>
        </td>

        <td class="files-col" style="text-align: center; vertical-align: middle;">
          <FilesView :files="files"/>
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
  methods   : { getOrgType, getRows, isPending },
  filters   : { timeFilter },
  i18n
}

function timeFilter (isoDateString, format='T')  {
  return DateTime.fromISO(isoDateString).toFormat(format)
}

function getOrgType({ organizationType }){
  return (organizationType||{}).acronym || organizationType;
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
  width: 100%;
}
.index-col{
  width: 2em;
  text-align: center;
  white-space: nowrap;
}
.agenda-items-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}
.files-col{
  width:200px;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}
.private-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}
.time-col{
  width:70px;
  text-align: right;
  white-space: nowrap;
}
.date-col{
  width:90px;
  text-align: center;
  white-space: nowrap;
}
@media screen and (max-width: 768px) {
  .files-col{
    width:65px;
    text-align: center;
    vertical-align: middle;
  }
}
</style>