
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
        @select="onChange"
        @remove="onChange"
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
      <multiselect 
      v-model="organization"
      track-by="name" 
      label="name"
      placeholder="Type to search" 
      open-direction="top" 
      :options="allOrganizations" 
      :multiple="true"
      :loading="isLoading" 
      :internal-search="false" 
      :options-limit="300" 
      :limit="3" 
      :max-height="600" 
      :taggable="true"
      @tag="addOrg"
      @close="organization? '' :onChange({t:''})"
      @select="onChange"
      @remove="onChange({t:''})"
      @search-change="getOrgs">

        <!-- <template slot="tag" slot-scope="{ option, remove }">
          <span class="custom__tag">
            <span>{{ option.name }}</span>
            <span class="custom__remove" @click="remove(option)">❌</span>
          </span>
          </template> -->
        
        <!-- <template slot="clear" slot-scope="props">
          <div class="multiselect__clear" v-if="organization" @mousedown.prevent.stop="organization=undefined"></div>
        </template> -->
        <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
      </multiselect>
      <pre>{{organization}}</pre>
    </div>
  </div>
</template>


<script>

import Multiselect  from 'vue-multiselect'
import AgendaItem   from './agenda-item.vue'
import FilesView    from './files-view.vue'
import i18n         from '../locales.js'
import Api, { mapObjectId }          from '../api.js'

export default {
  name: 'EditRow',
  props:{
    meetings   : { type: Array, required: true },
    route      : { type: Object, required: false },
    tokenReader: { type: Function, required: false },
  },
  components:{ Multiselect, AgendaItem, FilesView},
  computed   : { agendaItems },
  methods   :{clearText, getOrgs, addOrg, getQ, onChange},
  i18n,
  mounted,
  created,
  data,
  
}

function data(){
  return {
    selectedDate: undefined,
    selectedAgendaItems: [],
    time: '01:01',
    organization: '',
    allOrganizations:[],
    isLoading: false, 
    meetingId:''
  }
}

function onChange(element){


  this.$forceUpdate()
  setTimeout(()=>{
  const { $or } = this.getQ() || {}
  const {t, meetingId, organizationId, government } = element
  this.$emit('penging-query', {$or, t, meetingId, organizationId:organizationId?{$oid:organizationId}:'', government})
  }, 100)

}

function created(){
  this.api = new Api(this.tokenReader);
}


function addOrg(name){


  this.organization = {name}
  this.allOrganizations = []
}

async function mounted(){
  await this.getOrgs()
}

async function getOrgs(t){
  
  if(!t) return 
  
  this.isLoading= true
  const { meeting } = this.route.params

  const { _id:meetingId } = await this.api.getMeetingByCode(meeting)
  
  
  this.onChange({ meetingId,  t })

  this.allOrganizations = await this.api.getInterventionOrganizations({ meetingId , t } )
  this.isLoading= false
}

function clearText(){
  this.freeText=''
  this.onChange()
}

function getQ(){
  if(!this.selectedAgendaItems.length) return

  return { $or: this.selectedAgendaItems.map(i=>({ 
                                            meetingId : mapObjectId(i.meetingId),
                                            agendaItem : i.item
                                          }))};
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

