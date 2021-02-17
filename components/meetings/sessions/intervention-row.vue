<template >
  <tr  @click="$parent.$emit('select')">
    <td scope="row" class="index-col d-none d-md-table-cell" style="text-align: center; vertical-align: middle;">
        <span  v-if="!isPending(intervention.status)">{{index}}.</span>
        <small v-if="isPending(intervention.status)" class="text-muted lighter">{{$t('Pending')}}</small>
    </td>

    <td class="agenda-items-col" style="text-align: center; vertical-align: middle;">
        <AgendaItem :item="intervention.agenda || ( intervention.agendaItem && { item: intervention.agendaItem})"/>
    </td>

    <td class="date-col" style="text-align: center; vertical-align: middle;">
        <span>{{ intervention.datetime | timeFilter('MMM d') }}</span>
    </td>

    <td class="time-col" style="text-align: center; vertical-align: middle;">
        <span>{{ intervention.datetime | timeFilter('T') }}</span>
    </td>

    <td style="vertical-align: middle;"> 
        <span class="float-right text-muted">{{ getOrgType(intervention) }} </span>  
        {{ intervention.title }}
        <div v-if="summary" class="text-muted small summary">{{intervention.title}}</div>
        <slot>
            <FilesPreview v-if="isPending(intervention.status)" :files="intervention.files" />
        </slot>
    </td>

    <td class="files-col" style="text-align: center; vertical-align: middle;">
        <FilesView :files="intervention.files"/>
    </td>
    <td>
        <slot name="controls"/>
    </td>
  </tr>
</template>


<script>
import   AgendaItem   from './agenda-item.vue'
import   FilesView    from './files-view.vue'
import   i18n         from '../locales.js'
import   FilesPreview from './files-preview.vue'
import { DateTime   } from 'luxon'

export default {
  name      : 'InterventionLine',
  components: { AgendaItem, FilesView, FilesPreview },
  props     : { 
    index:        { type: Number,  required: false, default:null },
    intervention: { type: Object,  required: true },
    showStatus:   { type: Boolean, required: false, default: false },
},
  methods   : { getOrgType, isPending },
  filters   : { timeFilter },
  i18n, 
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

.summary { 
  max-height:40px;
  overflow:hidden;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  block-overflow: ellipsis;
  max-lines: 2;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;  
}
@media screen and (max-width: 768px) {
  .files-col{
    width:65px;
    text-align: center;
    vertical-align: middle;
  }
}
</style>