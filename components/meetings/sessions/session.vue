
<template >
  <table v-if="getRows().length" class="table table-striped table-hover no-border-first-row sessions" v-bind:key="index">
    <tbody  v-for="(interventions, i) in getRows()" v-bind:key="i">
      <tr v-for="(row, index) in interventions" v-bind:key="index" @dblclick="edit(row)"  v-on:click.prevent="select(row)" :class="{'table-info': isSelectedRow(row), 'table-warning':isSelectedEditRow(row) }" >

        <td scope="row" class="index-col d-none d-md-table-cell" style="text-align: center; vertical-align: middle;">
          <span  v-if="!isPending(status)">{{index+1}}.</span>
          <small v-if="isPending(status)" class="text-muted lighter">{{$t('Pending')}}</small>
        </td>

        <td class="agenda-items-col" style="text-align: center; vertical-align: middle;">
          <AgendaItem :item="row.agenda || ( row.agendaItem && { item: row.agendaItem})"/>
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
          <div class="summary text-muted small">{{summary || files[0].text}}</div>
        </td>

          <div v-if="showStatus && isPending(status)">
            <div v-for="{filename, url, text, _id } in files" :key="_id">
              <b><a style="color:inherit" :href="url" target="_blank">{{filename}}</a></b>
              <div v-if="text" class="text-muted small summary">{{text}}</div>
            </div>
          </div>
        </td>

        <td class="files-col" style="text-align: center; vertical-align: middle;">
          <FilesView :files="row.files"/>
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
                selectLimit: { type: Number, required: false, default: 1 }
              },
  methods   : { getOrgType, getRows, isPending },
  filters   : { timeFilter },
  i18n,
  data
}

function data(){
  return{
    selected: [],
    selectedEdit:undefined
  }
}

function edit(row){
  const { _id } = row

  console.log('this.selectedEdit', this.isSelectedEditRow(row))
  if(this.isSelectedEditRow(row)) this.selectedEdit = undefined
  else this.selectedEdit = _id
  
  console.log('this.selectedEdit', this.selectedEdit)
  this.$forceUpdate()
}

function select(row){
  const { _id } = row

  if(!this.selected)this.selected=[]

  if(this.selected.includes(_id))
    this.selected = this.selected.filter((x)=> x !== _id)
  else this.selectLimit===1? this.selected = [_id] : this.selected.push(_id)

  this.$forceUpdate()
}

function isSelectedRow(row){
  const { _id } = row

  return !!this?.selected?.includes(_id)
}
function isSelectedEditRow(row){
  const { _id } = row

  return this.selectedEdit === _id
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