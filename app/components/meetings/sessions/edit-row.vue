<template >
  <div class="row">

    <div class="col-2 pr-0">
      <div class="input-group">
        <AgendaSelect v-model="selectedAgendaItems" :meetings="meetings" @change="onChange" :max="10" :multiple="true" />
      </div>
    </div>

    <div class="col-1 px-0">
      <div class="input-group">
        <input v-model="timeText" type="text" class="form-control time" disabled/>
      </div>
    </div>

    <div class="col-7 px-0">
      <div class="input-group d-inline-block">
        <OrganizationSearch v-model="organization" v-bind="$props" @t="onChange" :taggable="true" placeholder="Type to search then select or Type and press enter to create"/>
      </div>
    </div>

    <div class="col-2 pl-0 text-right text-nowrap">
        <div class="d-inline-block">
          <button v-on:click="createSessionIntervention"  :disabled="isCreateSessionInterventionDisabled" class="btn btn-secondary" data-toggle="tooltip" data-placement="top" :title="$t('Create fileless intervention')" >
            <i class="fa fa-plus" />
          </button>
        </div>

        <div class="d-inline-block">
          <slot name="controls"/>
        </div>
    </div>

  </div>
</template>

<script>

import Api, { mapObjectId } from '../api.js'
import AgendaSelect       from './agenda-item-select.vue'
import OrganizationSearch from './organization-search-v2.vue'
import i18n               from '../locales.js'

import { cloneDeep      } from 'lodash'
import { dateTimeFilter } from '../filters.js'

export default {
  name         : 'EditRow',
  props        : {
                    meetings                 : { type: Array,    required: true },
                    route                    : { type: Object,   required: true },
                    tokenReader              : { type: Function, required: true },
                  },
  components : { AgendaSelect, OrganizationSearch },
  computed   : { meetingId, isCreateSessionInterventionDisabled },
  methods    : { 
                  onChange, 
                  getAgendaQuery,
                  createSessionIntervention,
                  clearForm,
                  resetTime,
                },
  i18n, data, created, beforeDestroy
}

function data(){
  return {
    selectedAgendaItems : [],
    organization        : [],
    timeText            : dateTimeFilter((new Date()).toISOString()),
    intervalRef         : undefined
  }
}

function created(){
  this.api          = new Api(this.tokenReader);
  this.intervalRef  = setInterval(this.resetTime, 60 * 1000);

  setTimeout(() => clearInterval(this.intervalRef), 30 * 60 * 1000) // just in case
}

function beforeDestroy(){
  clearInterval(this.intervalRef)
}

function meetingId(){ return (this.meetings[0] || {})._id }

function onChange(args){
  const { t, meetingId } = args
  const   agendaItem     = this.getAgendaQuery() || {}

  this.$emit('penging-query', { agendaItem, t, meetingId})
}

async function createSessionIntervention(){
  const { sessionId            } = this.route.params
  const { item     :agendaItem } = this.selectedAgendaItems[0]
  const { display  :title      } = this.organization[0]

  const organization = cloneDeep(this.organization[0])
  const datetime     = new Date()

  delete organization.display

  const line = { title, ...organization, agendaItem, meetingId:this.meetingId, datetime }

  await this.api.createIntervention(sessionId, line)

  this.$emit('new-intervention')
  this.clearForm()
}

function getAgendaQuery(){
  if(!this.selectedAgendaItems?.length) return

  const $or = this.selectedAgendaItems.map(i=>({ 
    meetingId : mapObjectId(i.meetingId),
    agendaItem : i.item
  }));

  return { $or };
}

function clearForm(){
  this.selectedAgendaItems = []
  this.organization        = []

  this.$forceUpdate()
}

function resetTime () {
  this.timeText = dateTimeFilter((new Date()).toISOString());
}

function isCreateSessionInterventionDisabled(){
  return this.selectedAgendaItems?.length!=1 || !this.organization?.length
}

</script>

<style >
.agenda     > .multiselect__tags{ border-radius: 5px 0px 0px 5px !important; }
.org-search > .multiselect__tags{ border-radius: 0px 5px 5px 0px !important; }

::-webkit-input-placeholder { /* Edge */
    color        : #adadad !important;
    display      : inline-block;
    margin-bottom: 10px;
    padding-top  : 2px;
    font-size    : 14px;
    font-family  : inherit;
    font-weight  : 300;
}
:-ms-input-placeholder { /* Internet Explorer 10-11 */
    color         : #adadad !important;
    display       : inline-block;
    margin-bottom : 10px;
    padding-top   : 2px;
    font-size     : 14px;
    font-family   : inherit;
    font-weight   : 300;
}
::placeholder {
    color        : #adadad !important;
    display      : inline-block;
    margin-bottom: 10px;
    padding-top  : 2px;
    font-size    : 14px;
    font-family  : inherit;
    font-weight  : 300;
}
</style>

<style scoped>
.type{
  font-weight   : lighter;
  text-transform: uppercase;
}
table.sessions {
  table-layout: fixed;
  width       : 100%;
}
.index-col{
  width     : 2em;
  max-width : 3em;
  text-align: center;
}
.agenda-items-col{
  width         : 65px;
  text-align    : center;
  vertical-align: middle;
}
.files-col{
  width         : 340px;
  text-align    : center;
  vertical-align: middle;
}
.private-col{
  width         : 65px;
  text-align    : center;
  vertical-align: middle;
}
.time-col{
  width     : 65px;
  text-align: center;
}
@media screen and (max-width: 768px) {
  .files-col{
    width         : 65px;
    text-align    : center;
    vertical-align: middle;
  }
}
</style>

<style scoped>
.time{
  height       : 43px;
  border       : 1px solid #e8e8e8;
  border-radius: 0px;
}
</style>
