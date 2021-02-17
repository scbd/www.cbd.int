
<template >
  <multiselect
    v-if="meetings.length"
    id="xxx"
    v-model="selectedAgendaItems"
    deselect-label="remove this value"
    :placeholder="$t('Agenda Item')"
    :options="agendaItems"
    :searchable="false"
    :multiple="multiple"
    group-values="items"
    group-label="normalizedSymbol"
    :hide-selected="multiple? true : false"
    track-by="item"
    label="display"
    @select="onChange"
    @remove="onChange"
    @input="onInput"
    class="agenda"
    />
</template>

<script>
import Multiselect        from 'vue-multiselect'
import i18n               from '../locales.js'
import { dateTimeFilterUTC } from '../filters.js'

export default {
  name      : 'AgendaItemSelect',
  components: { Multiselect },
  props     : { 
    meetings: { type: Array, required: true },
    value   : { type: [Object, Array], required: false },
    multiple: { type: Boolean, required: false, default: false },
  },
  methods   : { onInput, onChange },
  filters   : { dateTimeFilterUTC },
  computed  : { agendaItems },
  data,
  i18n,
  created
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
  this.$emit('change',data )
}

function onInput(){
  this.$emit('input',this.selectedAgendaItems )
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



</script>