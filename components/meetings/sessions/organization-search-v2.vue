<template >
        <multiselect 
          v-if="meetings.length"
          class  ="org-search"
          v-model="organization"
          tag-placeholder="Press enter to create an organization"
          track-by="display" 
          label="display"
          placeholder="Type to search" 
          open-direction="top" 
          :options="organizationOptions" 
          :multiple="true"
          :loading="isLoading" 
          :internal-search="false" 
          :options-limit="300" 
          :limit="3" 
          :max="1"
          :max-height="600" 
          :taggable="true"
          :preserveSearch="true"
          :hide-selected="multiple? true : false"
          @tag="createNewOrganization"
          @close="organization? '' :onChange({t:''})"
          @select="onChange"
          @remove="onChange({t:''})"
          @search-change="getOrganizationOptions"
          @input="onInput"
          >

            <template slot="noResult">
              <small class="text-warn"> {{$t('>Oops! No elements found. Consider changing the search query.')}}</small>
            </template>

            <template slot="maxElements">
              <small class="text-danger"> {{$t('Maximum 1 selection')}}</small>
            </template>

        </multiselect>
</template>

<script>
import Api , { mapObjectId } from '../api.js'

import { debounce, cloneDeep    } from 'lodash'
import   Multiselect   from 'vue-multiselect'
import { dateTimeFilter } from '../filters.js'

export default {
  name       : 'OrganizationSearch',
  props      : {
                  taggable    : { type:   Boolean        , required: false, default: false },
                  max         : { type:   Number         , required: false, default: 1 },
                  meetings    : { type:   Array          , required: true },
                  tokenReader : { type:   Function       , required: false },
                  value       : { type: [ Object, Array ], required: false }
                },
  components : { Multiselect },
  computed   : { meetingId },
  watch      : { value },
  methods    : { 
                  onChange: debounce(onChange, 100),
                  getOrganizationOptions,
                  mapOrganizationNames,
                  createNewOrganization,
                  onInput
                },
  created, mounted,
  data() {
    return {
      organization         : [],
      organizationOptions  : [],
      createdOrganizations : [],
      organizationTypes    : [],
      isLoading            : false
    }
  }
}

async function created(){
  this.api               = new Api(this.tokenReader);
  this.organizationTypes = await this.api.getInterventionOrganizationTypes();
}

async function mounted(){
  await this.getOrganizationOptions('e'); // preload with most popular leter search
}

function onChange({ t, meetingId }){
  if(t?.length > 2) this.$emit('t', { t, meetingId })
  // this.$emit('change', this.organization)
}

function meetingId(){ return (this.meetings[0] || {})._id }

async function getOrganizationOptions(t){
  const meetingId = this.meetingId

  if(!t || !meetingId) return 
  
  this.isLoading = true

  this.onChange({ meetingId, t }) // send search back to edit to filter pending

  const organizations = (await this.api.getInterventionOrganizations({ meetingId , t } )).map(this.mapOrganizationNames)

  this.organizationOptions = [ ...organizations, ...this.createdOrganizations ];
  this.isLoading           = false

  return this.organizationOptions
}

function mapOrganizationNames(organizationDetails){
  delete organizationDetails.score

  const { name: governmentName, acronym, government: governmentUpperCase, organizationTypeId, organizationId } = organizationDetails

  const organizationType = cloneDeep((this.organizationTypes.find(({ _id }) => _id === organizationTypeId)))
  const display          = `${governmentName}` + (!acronym? '' : `(${acronym})`)
  const government       = governmentUpperCase? governmentUpperCase.toLowerCase() : ''

  if(organizationType) delete organizationType._id

  return { display, government, governmentName,  organizationTypeId, organizationId }
}

function createNewOrganization(name){
  const newOrganization = { name, display: name }

  this.organization.push(newOrganization)

  this.createdOrganizations.push(newOrganization)
  this.organizationOptions.push(newOrganization)

  this.$emit('input', this.organization)
}

function onInput(){
  this.$emit('input', this.organization)

  const   meetingId    = this.meetingId
  const { display: t } = this.organization[0] || {}

  this.$emit('t', { t, meetingId })
}

function value(newValue){
  this.organization = newValue? newValue : []
}
</script>
