<template >
  <multiselect 
    v-if="meetings.length"
    v-model="selectedAgendaItems"
    deselect-label="remove this reservation"
    :placeholder="$t('Reservation')"
    :options="agendaItems"
    :searchable="false"
    :multiple="multiple"
    :max="max" 
    :hide-selected="multiple? true : false"
    :preserveSearch="true"
    @input="onInput"
    group-values="items"
    group-label="normalizedSymbol"
    track-by="_id"
    label="title"
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
  name      : 'ReservationSelect',
  components: { Multiselect },
  props     : { 
                resvervations: { type:   Array          , required: true },
                multiple     : { type:   Boolean        , required: false, default: true },
                max          : { type:   Number         , required: false, default: 1     },
                value        : { type: [ Object, Array ], required: false }
              },
  watch     : { value },
  methods   : { onInput },
  filters   : { dateTimeFilterUTC },
  computed  : { agendaItems },
  data, i18n, created
}

function created() { 
    this.killWatch = this.$watch('value',loadModelWatch)
}

async function loadModelWatch(newValue,oldValue){
  if(!oldValue && newValue)
    this.killWatch()
}

function data(){
  return {
    selected: [],
  }
}

function onInput(){
  this.$emit('input',  this.selected )
  this.$emit('change', this.selected )
}

function value(newValue){
  this.selected = newValue? newValue : []
}
</script>