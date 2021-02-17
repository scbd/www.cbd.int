<template >
  <div class="row">
    <div class="col-2 pr-0">
      <div class="input-group">
        <AgendaSelect v-model="selectedAgendaItem" :meetings="meetings" @change="onChange"/>
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
      track-by="display" 
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
      :taggable="true"
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
  
        <button v-on:click="createLine" class="btn btn-secondary"><i class="fa fa-plus" /></button>

    </div>
  </div>
</template>


<script>

import { debounce, omitBy, isNill, cloneDeep } from 'lodash'
import AgendaSelect from './agenda-item-select.vue'
import Multiselect  from 'vue-multiselect'

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
  components : { Multiselect, FilesView, AgendaSelect},
  computed   : {meetingId},
  methods    : { clearText, getOrgs, addOrg, getQ, onChange: debounce(onChange, 100), createLine, mapOrganizationNames },
  i18n,
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
    createdOrganizations:[],
    isLoading: false,
    organizationTypes:[]
  }
}

function meetingId(){
  const  { _id }  = this.meetings[0] || {}
  
  return _id 
}

function onChange(element){

  this.$forceUpdate()

  const agendaItem = this.getQ() || {}
  const { t  } = element
  this.$emit('penging-query', { agendaItem, t })
}

async function created(){
  this.api = new Api(this.tokenReader);
  this.getOrgs('e')
  this.organizationTypes = await this.api.getInterventionOrganizationTypes();
}

async function createLine(){

  const { sessionId } = this.route.params
  const { item:agendaItem, meetingId     } = this.selectedAgendaItem
  const { display:title } = this.organization[0]


  const organization = cloneDeep(this.organization[0])
  const datetime = new Date()

  delete organization.display

console.log('organization', organization)
  //this.timeText

  //agenda, agendaItem, conferenceId, datetime, government, meeting, meetingId, organizationType, organizationTypeName, sessionId, status, title

  const line = { title, ...organization, agendaItem, meetingId: { $oid: meetingId }, datetime }

  await this.api.createIntervention(sessionId, line)
}


function addOrg(name){
  this.organization = { name, display: `${name} `}
  this.createdOrganizations.push(this.organization)
  this.allOrganizations.push(this.organization)
}


async function getOrgs(t){
  
  if(!t || !this.meetingId) return 
  
  this.isLoading= true

  const meetingId = this.meetingId
  this.onChange({ meetingId, t })

  const organizations = (await this.api.getInterventionOrganizations({ meetingId , t } )).map(this.mapOrganizationNames)

  this.allOrganizations = [ ...organizations, ...this.createdOrganizations ];

  this.isLoading = false
}

function mapOrganizationNames(organizationDetails){
  delete organizationDetails.score

  const { name:governmentName, acronym, government:governmentUpperCase, organizationTypeId, organizationId } = organizationDetails

  const organizationType = cloneDeep((this.organizationTypes.find(({ _id }) => _id === organizationTypeId)))
  const display          = `${governmentName}` + (!acronym? '' : `(${acronym})`)
  const government       = governmentUpperCase? governmentUpperCase.toLowerCase() : ''


  if(organizationType) delete organizationType._id

//organizationType, organizationId: { $oid: organizationId },
  return { display, government, governmentName,  organizationTypeId: { $oid: organizationTypeId } }
}

function clearText(){
  this.freeText=''
  this.onChange()
}

function getQ(){
  if(!this.selectedAgendaItem) return

  const {  item: agendaItem } = this.selectedAgendaItem;

  return agendaItem? { agendaItem } : undefined
}

//omitBy(, isNil)
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
