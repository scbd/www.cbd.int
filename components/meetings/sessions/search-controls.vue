
<template >
  <div class="row mb-3">
    <div class="col-3 pr-0">
      <multiselect
        v-if="agendaItems"
        id="xxx"
        v-model="selectedAgendaItems"
        deselect-label="remove this value"
        :placeholder="$t('Agenda Item')"
        :options="agendaItems"
        :searchable="false"
        :multiple="true"
        group-values="items"
        group-label="name"
        :hide-selected="true"
        track-by="identifier"
        label="name"
        @select="onChange"
        @remove="onChange"
        class="agenda"
        >
        <template  slot="option" slot-scope="props" >
          <div class="row" v-if="props.option.$groupLabel">
            <div class="col-12">
              <span class="filter-label">{{ props.option.$groupLabel}}</span>
            </div>
          </div>
          <div class="row" v-if="!props.option.$groupLabel">
            <div class="col-12">
              <span  >{{props.option.name}}</span>
            </div>
          </div>
        </template>
      </multiselect>
    </div>
    <div class="col-6 px-0">
      <div class="input-group">
        <input  :placeholder="$t('Text Search')" v-model="t" v-on:input="onChange" type="text" class="form-control text-search" id="text-search" ref="textSearch"/>
          <div class="input-group-append">
            <button v-on:click="clearText" class="btn btn-outline-secondary clear-t" type="button"><i class="fa fa-close" /></button>
          </div>
      </div>
    </div>
    <div class="col-3 pl-0">
      <multiselect 
        v-model="selectedDate" 
        :placeholder="$t('Date')"
        :options="dates"
        :searchable="false"
        @select="onChange"
        @remove="onChange"
        class="dates">
        <template slot="singleLabel" slot-scope="{option}">
          {{ option | dateTimeFilter('yyyy-MM-dd')}}
        </template>
        <template slot="option" slot-scope="{option}">
          {{ option | dateTimeFilter('yyyy-MM-dd')}}
        </template>
      </multiselect>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import i18n        from '../locales.js'

import { getAgendaItems } from '../api.js'
import { getMeetingCode, deleteFalsyKey } from '../util'
import { dateTimeFilter } from '../filters.js'

export default {
  name      : 'SearchControls',
  components: { Multiselect },
  props     : { 
                dates: { type: Array, required: false },
                agendaItems: { type: Array, required: false },
              },
  methods   : {onChange,  updateSearchQuery, buildQuery, clearText},
  filters   : {dateTimeFilter},
  i18n,
  data,
  created
}

function   data(){
  return {
    t: '',
    selectedDate: undefined,
    selectedAgendaItems: [],
  }
}

function clearText(){
  this.t=''
  this.onChange()
}

function created(){
  const allItems = []
  const { identifiers, t } = readSearchParams()

  for (const { items } of this.agendaItems) {
    allItems.push(...items)
  }
  if(identifiers.length) this.selectedAgendaItems = allItems.filter(({ identifier }) => identifiers.includes(identifier))
  if(t) this.t = t
  console.log('--------',t )
  if(t || identifiers.length) setTimeout(()=>this.$emit('query',this.buildQuery()), 100)
}

function onChange(){
  setTimeout(this.updateSearchQuery, 100)
  setTimeout(()=>this.$emit('query',this.buildQuery()), 200)
}

function buildQuery(){
  const q   = {}
  const $or = []

  for (const { meeting, item } of this.selectedAgendaItems)
    $or.push({ 'meeting.symbol': meeting, agendaItem: item })
  
  if($or.length) q.$or = $or

  if(this.selectedDate) q.datetime = { $gte: { '$date' : this.selectedDate } }

  const t = this.t? this.t : ''

  return deleteFalsyKey([Object.keys(q).length? q : getMeetingCode(), t])
}



function updateSearchQuery(){
  resetSearchParams()
  this.selectedAgendaItems.forEach(({ identifier }) => addParam(identifier))
  if(this.selectedDate) addParam(this.selectedDate)
  if(this.t) addParam(this.t, true)
}

function resetSearchParams(){
  const { href, search } = window.location
  const newUrl           = href.replace(search, '')

  window.history.pushState({ path: newUrl }, '', newUrl)
}

function readSearchParams(){
  const params      = (new URL(document.location)).searchParams
  const identifiers = params.getAll('filter')
  const t           = params.get('t')

  return { identifiers, t }
}

function addParam(value, isText=false){
  const { origin, search, pathname } = new URL(window.location)
  const newSearchParam              = isText? `t=${encodeURIComponent(value)}` : `filter=${encodeURIComponent(value)}`
  const newSearch                   = !search? `?${newSearchParam}` : `${search}&${newSearchParam}`
  const newUrl                      = `${origin}${pathname}${newSearch}`
  
  window.history.pushState({ path: newUrl }, '', newUrl)
}
</script>
<style >
.agenda > .multiselect__tags{
  border-radius: 5px 0px 0px 5px !important;
}
.dates > .multiselect__tags{
  border-radius: 0px 5px 5px 0px !important;
}
.input-group-append > .clear-t {
  border-radius: 0px !important;
}
::-webkit-input-placeholder { /* Edge */
      color: #adadad !important;
    display: inline-block;
    margin-bottom: 10px;
    padding-top: 2px;
    font-size: 14px;
        font-family: inherit;
    font-weight:300;
}

:-ms-input-placeholder { /* Internet Explorer 10-11 */
      color: #adadad !important;
    display: inline-block;
    margin-bottom: 10px;
    padding-top: 2px;
    font-size: 14px;
    font-family: inherit;
    font-weight:300;
}

::placeholder {
      color: #adadad !important;
    display: inline-block;
    margin-bottom: 10px;
    padding-top: 2px;
    font-size: 14px;
        font-family: inherit;
    font-weight:300;
}
</style>
<style scoped>
.text-search{
  height:43px;
  border: 1px solid #e8e8e8;
  border-radius:0px;
}

</style>
