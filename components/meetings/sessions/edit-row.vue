<template >
  <div class="row">
    <div class="col-2 pr-0">
      <div class="input-group">
        <select class="form-control" id="agendaItem"  v-model="selectedAgendaItem" required>
          <optgroup v-for="{ _id: meetingId, agenda, normalizedSymbol } in meetings" :key="meetingId" :label="normalizedSymbol">
            <option v-for="{ item, shortTitle, title } in agenda.items" :key="item" :value="{ meetingId, item }">{{item }} - {{ shortTitle || title }} </option>
          </optgroup>
        </select>
      </div>
    </div>
    <div class="col-1 px-0">
      <div class="input-group">
        <input   v-model="timeText" type="text" class="form-control time"/>
      </div>
    </div>
    <div class="col-8 px-0">
      <div class="input-group d-inline-block">
      <multiselect 
      class="org-search"
      v-model="organization"
      track-by="name" 
      label="display"
      placeholder="Type to search" 
      open-direction="top" 
      :options="allOrganizations" 
      :multiple="true"
      :loading="isLoading" 
      :internal-search="false" 
      :options-limit="300" 
      :limit="3" 
      :max-height="600" 
      @tag="addOrg"
      @close="organization? '' :onChange({t:''})"
      @select="onChange"
      @remove="onChange({t:''})"
      @search-change="getOrgs">
      >
        <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>

      </multiselect>
      </div>
    </div>
    <div class="col-1 pl-0 text-center">
  
        <button class="btn btn-secondary"><i class="fa fa-plus" /></button>

    </div>
  </div>
</template>


<script>

import { debounce } from 'lodash'
import Multiselect  from 'vue-multiselect'
import AgendaItem   from './agenda-item.vue'
import FilesView    from './files-view.vue'
import i18n         from '../locales.js'
import { dateTimeFilter } from '../filters.js'
import Api, { mapObjectId }          from '../api.js'

export default {
  name: 'EditRow',
  props:{
    meetings   : { type: Array, required: true },
    route      : { type: Object, required: false },
    tokenReader: { type: Function, required: false },
  },
  components : { Multiselect, AgendaItem, FilesView},
  methods    : {clearText, getOrgs, addOrg, getQ, 
  onChange: debounce(onChange, 100)},
  i18n,
  mounted,
  created,
  data,
  
}

function data(){
  const now = new Date()

  return {
    selectedDate: undefined,
    selectedAgendaItem: null,
    timeText: dateTimeFilter(now.toISOString()),
    organization: '',
    allOrganizations:[],
    isLoading: false, 
    meetingId:''
  }
}

function onChange(element){

  this.$forceUpdate()

  const agendaItem = this.getQ() || {}
  const {t, meetingId, organizationId, government } = element
  this.$emit('penging-query', {agendaItem, t, organizationId, government})
}

function created(){
  this.api = new Api(this.tokenReader);
  this.getOrgs()
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

  const { _id:meetingId } = await this.api.getMeetingByCode(meeting) // should hget from parent objects
  
  
  this.onChange({ meetingId,  t })

  const organizations = await this.api.getInterventionOrganizations({ meetingId , t } )

  organizations.forEach(o=> o.display = `${o.name} ${(o.acronym||'') && `(${o.acronym})`}`)

  this.allOrganizations = organizations;

  this.isLoading= false
}

function clearText(){
  this.freeText=''
  this.onChange()
}

function getQ(){
  if(!this.selectedAgendaItem) return

  const { meetingId, item: agendaItem } = this.selectedAgendaItem;

  return { meetingId, agendaItem }
}
</script>

<style >
.agenda > .multiselect__tags{
  border-radius: 5px 0px 0px 5px !important;
}

.org-search > .multiselect__tags{
  border-radius: 0px 5px 5px 0px !important;
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
<style scoped>
.time{
  height:43px;
  border: 1px solid #e8e8e8;
  border-radius:0px;
}
.debug{
  border: 1px solid red !important;
}
</style>
