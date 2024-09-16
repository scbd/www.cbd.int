<template >
  <tr :_id="intervention._id" @click="$parent.$emit('select')">

    <td scope="row" class="index-col d-none d-lg-table-cell" style="text-align: center; vertical-align: middle;">
        <b  v-if="!isPending(intervention.status)">{{index}}.</b>
        <small v-if="isPending(intervention.status)" class="text-muted lighter">{{$t('Pending')}}</small>
    </td>

    <td class="agenda-items-col d-none d-lg-table-cell" style="text-align: center; vertical-align: middle;">
        <AgendaItem :item="intervention.agenda || ( intervention.agendaItem && { item: intervention.agendaItem})"/>
    </td>

    <td v-if="showDate" class="date-col d-none d-lg-table-cell" style="text-align: center; vertical-align: middle;">
        <span>{{ intervention.datetime | setTimezone(timezone) | formatDate('MMM d') }}</span>
    </td>

    <td v-if="showTime"  class="time-col d-none d-lg-table-cell" style="text-align: center; vertical-align: middle;">
        <span :title="intervention.datetime | setTimezone(timezone) | formatDate('z')">
          {{ intervention.datetime | setTimezone(timezone) | formatDate('T') }}
        </span>
    </td>

    <td style="vertical-align: middle;"> 
        <span class="float-right text-muted">{{ getOrgType(intervention) }} </span>  

        <span class="title">{{ intervention.title }}</span>
        <div v-if="intervention.summary" class="text-muted small summary">{{intervention.summary}}</div>

        <div class="d-lg-none small">
          <AgendaItem :item="intervention.agenda || ( intervention.agendaItem && { item: intervention.agendaItem})"/>
          <span v-if="showDate">{{ intervention.datetime | setTimezone(timezone) | formatDate('MMM d') }}</span>
          <span v-if="showTime"
            :title="intervention.datetime | setTimezone(timezone) | formatDate('z')">
            {{ intervention.datetime | setTimezone(timezone) | formatDate('T') }}
          </span>
        </div>

        <slot>
            <FilesPreview v-if="isPending(intervention.status)" :files="intervention.files"/>
        </slot>

        <div>
          <span class="badge badge-light" v-for="{ tag, title } in tags" :key="tag">
            {{title}}
          </span>   
        </div>

    </td>

    <td class="files-col" style="text-align: center; vertical-align: middle;">
        <FilesView :files="intervention.files" :show-preview-as-button="showPreviewAsButton"/>
    </td>

    <td class="controls-col" >
        <slot name="controls"/>
    </td>
    
  </tr>
</template>

<script>
import   AgendaItem   from './agenda-item.vue'
import   FilesView    from './files-view.vue'
import   i18n         from '../locales.js'
import   FilesPreview from './files-preview.vue'
import { format as formatDate, timezone as setTimezone } from '../datetime.js'
import { isPublic as isTagPublic, 
         getTitle as getTagTitle } from './tags.js'

export default {
  name      : 'InterventionLine',
  components: { AgendaItem, FilesView, FilesPreview },
  props     : { 
                  index       : { type: Number,  required: false, default:null },
                  intervention: { type: Object,  required: true },
                  showDate    : { type: Boolean, required: false, default: true },
                  showTime    : { type: Boolean, required: false, default: true },
                  publicView  : { type: Boolean, required: false, default: false },
                  timezone    : { type: String,  required: false, default: 'local' },
                  showPreviewAsButton : { type: Boolean, default: false }
              },
  methods   : { getOrgType, isPending },
  filters   : { formatDate, setTimezone },
  computed  : { tags },
  i18n, 
}

function tags() {

  let tags = this.intervention?.tags || [];

  if(this.publicView)
    tags = tags.filter(isTagPublic);

  return tags.map(tag=>({ tag, title: getTagTitle(tag) }));
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

.controls-col {
  text-align: right;
  vertical-align: middle;
}

.title {
  font-weight: bold;
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