
<template >
  <div class="row mb-3">
    <div class="col-3 pr-0">
      <multiselect
        v-if="meetings.length"
        id="xxx"
        v-model="selectedAgendaItems"
        deselect-label="remove this value"
        :placeholder="$t('Agenda Item')"
        :options="agendaItems"
        :searchable="false"
        :multiple="true"
        group-values="items"
        group-label="normalizedSymbol"
        :hide-selected="true"
        track-by="item"
        label="display"
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
              <span  >{{props.option.display}}</span>
            </div>
          </div>
        </template>
      </multiselect>
    </div>
    <div class="col-9">
      <div class="input-group">
        <input  :placeholder="$t('Text Search')" v-model="freeText" v-on:input="onChange" type="text" class="form-control text-search" id="text-search" ref="textSearch"/>
          <div class="input-group-append">
            <button v-on:click="clearText" class="btn btn-outline-secondary clear-t" type="button"><i class="fa fa-close" /></button>
          </div>
      </div>
    </div>
    <div v-if="false" class="col-3 pl-0">
      <multiselect 
        v-model="selectedDate" 
        :placeholder="$t('Date')"
        :options="dates"
        :searchable="false"
        @select="onChange"
        @remove="onChange"
        class="dates">
        <template slot="singleLabel" slot-scope="{option}">
          {{ option | dateTimeFilterUTC('yyyy-MM-dd')}}
        </template>
        <template slot="option" slot-scope="{option}">
          {{ option | dateTimeFilterUTC('yyyy-MM-dd')}}
        </template>
      </multiselect>
    </div>
  </div>
</template>

<script>
import { debounce }       from 'lodash'
import Multiselect        from 'vue-multiselect'
import i18n               from '../locales.js'
import { mapObjectId }    from '../api.js'
import { dateTimeFilterUTC } from '../filters.js'

export default {
  name      : 'SearchControls',
  components: { Multiselect },
  props     : { 
    meetings: { type: Array, required: true },
  },
  methods   : { onChange : debounce(onChange, 400), buildQuery, clearText},
  filters   : { dateTimeFilterUTC },
  computed  : { agendaItems },
  data,
  i18n,
  created() { this.onChange() },
}

function data(){
  return {
    freeText: '',
    selectedDate: undefined,
    selectedAgendaItems: [],
  }
}

function clearText(){
  this.freeText=''
  this.onChange()
}

function agendaItems() {
  return this.meetings.map(m=>({
    normalizedSymbol : m.normalizedSymbol,
    items : m.agenda.items.map(i=>({ ...i, 
      meetingId: m._id, 
      display:   `${i.item} - ${i.shortTitle}`,
    }))
  }));
}

function onChange(){
  this.$emit('query',this.buildQuery());
//setTimeout(this.updateSearchQuery, 100)
}

function buildQuery(){

  const freeText = this.freeText;
  const queries  = []

  // Limit to current meetings
  queries.push({ $or: this.meetings.map(m=>({ meetingId : mapObjectId(m._id)})) });

  if(this.selectedAgendaItems.length) {
    const $or = this.selectedAgendaItems.map(i=>({ 
      meetingId : mapObjectId(i.meetingId),
      agendaItem : i.item
    }));

    queries.push({ $or });
  }

  const query = { $and : queries };
  return { query, freeText };
}

// DISABLED //
// DISABLED //
// DISABLED //
// DISABLED //
// DISABLED //
/*
function created(){

  this.onChange();


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
*/
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
