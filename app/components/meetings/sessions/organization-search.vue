<template >
  <multiselect 
    class="org-search"
    v-model="organization"
    track-by="name" 
    label="display"
    placeholder="Type to search" 
    open-direction="bottom" 
    :options="organizations" 
    :multiple="false"
    :loading="isLoading" 
    :internal-search="false" 
    :options-limit="300" 
    :limit="3" 
    :max-height="600" 
    @close="organization? '' :onChange({t:''})"
    @select="onChange"
    @remove="onChange({t:''})"
    @search-change="queryOrganizations">
    >
      <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>

  </multiselect>
</template>


<script>

import { debounce } from 'lodash'
import Multiselect  from 'vue-multiselect'
import Api, { mapObjectId } from '../api.js'

export default {
  name: 'OrganizationSearch',
  props:{
    meetings   : { type: Array, required: true },
    tokenReader: { type: Function, required: false },
  },
  components : { Multiselect },
  methods    : { queryOrganizations, onChange: debounce(onChange, 100)},
  created,
  data() {
    return {
      organizations:[],
      organization:[],
      isLoading: false, 
    }
  }
}

function created(){
  this.api = new Api(this.tokenReader);
}

function onChange(element){
  this.$emit('change', this.organization)
}


async function queryOrganizations(text){
  
  if(!text) return 
  
  this.isLoading= true

  const meetingId = this.meetings[0]._id; 

  const organizations = await this.api.getInterventionOrganizations({ meetingId , t:text } )

  organizations.forEach(o=> o.display = `${o.name} ${(o.acronym||'') && `(${o.acronym})`}`)

  this.organizations = organizations;

  this.isLoading= false
}

</script>
