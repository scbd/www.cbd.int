<template >
  <multiselect 
    v-if="meetings.length"
    v-model="selectedAgendaItems"
    deselect-label="remove this agenda item"
    :placeholder="$t('Agenda Item')"
    :options="agendaItems"
    :searchable="true"
    :max="max" 
    :multiple="multiple"
    :close-on-select="!multiple"
    :clear-on-select="!multiple"
    :hide-selected="multiple"
    :preserveSearch="true"
    @input="onInput"
    class="agenda"
    track-by="key"
    label="textSearch"
    >

    <template slot="maxElements">
      <small class="text-danger"> {{$t('Maximum 1 selection')}}</small>
    </template>

    <template slot="option" slot-scope="{option}">
      <AgendaItem :item="option" :show-caption="true"/>
    </template>   

    <template slot="tag" slot-scope="{option,remove}">
      <div class="tag">
        <span class="tag-remove text-danger" @click="remove(option)">
          <i class="fa fa-times"></i>
        </span>
        <AgendaItem :item="option" :show-caption="true"/>
      </div>
    </template>   
  </multiselect>
</template>

<script>
import _ from 'lodash'
import   Multiselect         from 'vue-multiselect'
import   i18n                from '../locales.js'
import   AgendaItem   from './agenda-item.vue'

export default {
  name      : 'AgendaItemSelect',
  components: { Multiselect, AgendaItem },
  props     : { 
                meetings: { type:   Array          , required: true },
                multiple: { type:   Boolean        , required: false, default: true },
                max     : { type:   Number         , required: false, default: 1     },
                value   : { type: [ Object, Array ], required: false }
              },
  watch     : { value },
  methods   : { onInput },
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

function onInput(){
  this.$emit('input',this.selectedAgendaItems )
  this.$emit('change', this.selectedAgendaItems )
}

function agendaItems() {

  const withPrefix = this.meetings.length>1;

  const entries = _(this.meetings).map(m=>{
    const prefix = withPrefix ? (m?.agenda?.prefix || m.normalizedSymbol ) : '';
    const color  = m?.agenda?.color;
    return m.agenda.items.map(i=>({ ...i, 
      color,
      prefix,
      meetingId: m._id, 
      key: `${m._id}-${i.item}`,
      textSearch: `${prefix} ${i.item} - ${i.title || i.shortTitle}`.trim(),
    }));
  }).flatten().value();

  return entries;
}

function value(newValue){
  this.selectedAgendaItems = newValue? newValue : []
}
</script>

<style scoped>
 .tag {
   white-space:nowrap;
   overflow:hidden;
   text-overflow: ellipsis;
 }
 .tag-remove {
   cursor: pointer;
 }
</style>