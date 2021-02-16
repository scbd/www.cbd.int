
<template >
  <div class="row">
    <div class="col-2">
      <multiselect
        v-if="meetings.length"
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
    <div class="col-2">
      <div class="input-group">
        <input   v-model="time" type="text" class="form-control "/>
      </div>
    </div>
    <div class="col-8">
      <div class="input-group">
        <input  :placeholder="$t('Organization Search')" v-model="organization" type="text" class="form-control " />
          <div class="input-group-append">
            <button v-on:click="clearText" class="btn btn-outline-secondary clear-t" type="button"><i class="fa fa-close" /></button>
          </div>
      </div>
    </div>
  </div>
</template>


<script>

import Multiselect  from 'vue-multiselect'
import AgendaItem   from './agenda-item.vue'
import FilesView    from './files-view.vue'
import i18n         from '../locales.js'
import Api          from '../api.js'

export default {
  name: 'EditRow',
  props:{
    meetings   : { type: Array, required: true },
    route      : { type: Object, required: false },
    tokenReader: { type: Function, required: false },
  },
  components:{ Multiselect, AgendaItem, FilesView},
  computed   : { agendaItems },
  methods   :{clearText},
  i18n,
  mounted,
  created,
  data,
  
}

function data(){
  return {
    freeText: '',
    selectedDate: undefined,
    selectedAgendaItems: [],
    time: '01:01',
    organization: ''
    
  }
}

function created(){
  this.api = new Api(this.tokenReader);
}

async function mounted(){
  const promises = [
                      this.api.getSessionById(this.route.params.sessionId),
                      this.api.getInterventionsBySessionId(this.route.params.sessionId)
                    ]
  const [ session, interventions ] = await Promise.all(promises);

  this.session               = session;
  this.session.interventions = interventions;
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
</script>


<style scoped>
.type{
  font-weight: lighter;
  text-transform: uppercase;
}
table.sessions {
  table-layout: fixed;
  width: 100%;
}
.index-col{
  width: 2em;
  max-width: 3em;
  text-align: center;
}


.agenda-items-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}


.files-col{
  width:340px;
  text-align: center;
  vertical-align: middle;
}
.private-col{
  width:65px;
  text-align: center;
  vertical-align: middle;
}
.time-col{
  width:65px;
  text-align: center;
}

@media screen and (max-width: 768px) {
  .files-col{
    width:65px;
    text-align: center;
    vertical-align: middle;
  }
}
</style>

