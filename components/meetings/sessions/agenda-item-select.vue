
<template >
  <multiselect 
    v-if="meetings.length"
    v-model="selectedAgendaItems"
    deselect-label="remove this agenda item"
    :placeholder="$t('Agenda Item')"
    :options="agendaItems"
    :searchable="false"
    :multiple="multiple"
    :max="max" 
    :hide-selected="multiple? true : false"
    :preserveSearch="true"
    @select="onChange"
    @remove="onChange"
    @input="onInput"
    class="agenda"
    group-values="items"
    group-label="normalizedSymbol"
    track-by="item"
    label="display"
    >

    <template slot="maxElements">
      <small class="text-danger"> {{$t('Maximum 1 selection')}}</small>
    </template>

  </multiselect>
</template>

<script>
import   Multiselect         from 'vue-multiselect'
import   i18n                from '../locales.js'
import { dateTimeFilterUTC } from '../filters.js'

export default {
  name      : 'AgendaItemSelect',
  components: { Multiselect },
  props     : { 
                meetings: { type:   Array          , required: true },
                multiple: { type:   Boolean        , required: false, default: true },
                max     : { type:   Number         , required: false, default: 1     },
                value   : { type: [ Object, Array ], required: false }
              },
  watch     : { value },
  methods   : { onInput, onChange },
  filters   : { dateTimeFilterUTC },
  computed  : { agendaItems },
  data, i18n, created
}

function created() { 
    this.killWatch = this.$watch('value',loadModelWatch)
}

  async function loadModelWatch(newValue,oldValue){
    if(!oldValue && newValue){
      this.killWatch()
      // this.selectedAgendaItems = await LookUp[`get${this.type}`](newValue, true)
    }
  }

function data(){
  return {
    selectedAgendaItems: [],
  }
}

function onChange(data){
  // this.$forceUpdate()
  // this.$emit('change', [data] )
  console.log('agenda-item0select-data', data)
  console.log('agenda-item0select-data this.selectedAgendaItems', this.selectedAgendaItems)
}

function onInput(){
  this.$emit('input',this.selectedAgendaItems )
  this.$emit('change', this.selectedAgendaItems )
console.log('@input this.selectedAgendaItems ', this.selectedAgendaItems )
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

function value(newValue){
  this.selectedAgendaItems = newValue? newValue : []
}
</script>