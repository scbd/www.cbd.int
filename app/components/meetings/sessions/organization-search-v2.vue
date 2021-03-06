<template >
  <multiselect 
    v-if="meetings.length"
    v-model="organization"
    
    class="org-search"
    track-by="display" 
    label="display"
    open-direction="top"

    :tag-placeholder="$t('Press enter to create an organization')"
    :placeholder="$t(placeholder)"
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
    @close="onChange((organization[0]||{}).name)"
    @select="onChange($event)"
    @remove="onChange('')"
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
import   Api                      from '../api.js'
import   Multiselect              from 'vue-multiselect'
import { debounce   , cloneDeep } from 'lodash'

export default {
  name       : 'OrganizationSearch',
  props      : {
                  placeholder : { type:   String         , required: false, default: 'Type to search' },
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
                  onChange: debounce(onChange, 400),
                  getOrganizationOptions: debounce(getOrganizationOptions, 400),
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
      isLoading            : false,
      lastText             : null
    }
  }
}

async function created(){
  this.api               = new Api(this.tokenReader);
  this.organizationTypes = await this.api.getInterventionOrganizationTypes();
}

async function mounted(){
//  await this.getOrganizationOptions('e'); // preload with most popular leter search
}

function onChange(text, source){
  console.log(source, text);
  this.$emit('t', { t: text});
}

function meetingId(){ return (this.meetings[0] || {})._id }

async function getOrganizationOptions(t){
  
  const meetingId = this.meetingId

  if(!t || !meetingId) return 
  
  this.isLoading = true

  this.onChange(t, 'getOrganizationOptions')
  const organizations = (await this.api.getInterventionOrganizations({ meetingId , t } )).map(this.mapOrganizationNames)

  this.organizationOptions = [ ...organizations, ...this.createdOrganizations ];
  this.isLoading           = false

  return this.organizationOptions
}

function mapOrganizationNames(organizationDetails){
  delete organizationDetails.score

  const { name, acronym, governmentName, government: governmentUpperCase, organizationTypeId, organizationId } = organizationDetails

  const organizationType = cloneDeep((this.organizationTypes.find(({ _id }) => _id === organizationTypeId)))
  const display          = `${name}` + (!acronym? '' : `(${acronym})`)
  const government       = governmentUpperCase? governmentUpperCase.toLowerCase() : ''

  if(organizationType) delete organizationType._id

  return { display, name, government, governmentName,  organizationTypeId, organizationId }
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
  //this.onChange(this.organization[0].name);
}

function value(newValue){
  this.organization = newValue? newValue : []
}
</script>
