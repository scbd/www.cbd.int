
<template >
  <div class="row">
    <div class="col-3 pr-0">
      <multiselect
        v-if="agendaItems && agendaItems.length"
        id="xxx"
        v-model="selectedAgendaItems"
        deselect-label="remove this value"
        placeholder="Agenda Item"
        :options="agendaItems"
        :searchable="false"
        :multiple="true"
        group-values="items"
        group-label="name"
        :hide-selected="true"
        track-by="name"
        label="name"
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
      <div class="form-group">
        <input v-model="t" type="text" class="form-control" id="text-search" ref="textSearch"/>
      </div>
    </div>
    <div class="col-3 pl-0">
      <!-- {{selectedDate}}
      <multiselect v-model="selectedDate" deselect-label="Can't remove this value"  placeholder="" :options="options" :searchable="false" >
        <template slot="singleLabel" slot-scope="{option}"><AgendaItem  :item="option"/></template>
      </multiselect> -->
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import i18n        from '../locales.js'

import { getAgendaItems } from '../api.js'
import { getMeetingCode } from '../util'


export default {
  name      : 'SearchControls',
  components: { Multiselect },
  props     : { 
                dates: { type: Date, required: false },
                agendaItems: { type: Date, required: false },
              },

  computed: { hasMultipleMeetings },
  i18n,
  data,
  created
}

function   data(){
  return {
    t: '',
    selectedDate: undefined,
    selectedAgendaItems: [],
    agendaItems:[]
  }
}

async function created(){
  this.agendaItems = await getAgendaItems(getMeetingCode())
}

function hasMultipleMeetings(){
  const meetingSet = new Set (this.options.map(({ meeting }) => meeting))

  return meetingSet.size > 1
}

// function getAgendaItems(){
//   return this.options.map(this.mapAgendaItems)
// }


function onClose(){
  this.t =''
}

function readSearchParams(){
  const params  = (new URL(document.location)).searchParams
  const filters = params.getAll('filter')

  filters.forEach(identifier => this.addFilter(identifier))
}

function resetSearchParams(){
  const { href, search } = window.location
  const newUrl           = href.replace(search, '')

  window.history.pushState({ path: newUrl }, '', newUrl)
}

function addParam(value){
  const { origin, search, pathname } = new URL(window.location)
  const newSearchParam              = `filter=${encodeURIComponent(value)}`
  const newSearch                   = !search? `?${newSearchParam}` : `${search}&${newSearchParam}`
  const newUrl                      = `${origin}${pathname}${newSearch}`
  
  window.history.pushState({ path: newUrl }, '', newUrl)
}


</script>

<style scoped>

</style>