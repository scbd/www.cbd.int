
<template >
  <div class="row">
    <div class="col pr-0">
      <multiselect v-model="value" deselect-label="Can't remove this value"  placeholder="" :options="options" :searchable="false" >
        <template slot="singleLabel" slot-scope="{option}"><AgendaItem  :item="option"/></template>
      </multiselect>
    </div>
    <div class="col px-0">
      <div class="form-group">
        <input type="text" class="form-control" id="text-search" ref="textSearch"/>
      </div>
    </div>
    <div class="col pl-0">
      <multiselect v-model="value" deselect-label="Can't remove this value"  placeholder="" :options="options" :searchable="false" >
        <template slot="singleLabel" slot-scope="{option}"><AgendaItem  :item="option"/></template>
      </multiselect>
    </div>
  </div>
</template>


<script>
import Multiselect from 'vue-multiselect'
import i18n        from '../locales.js'

export default {
  name      : 'SearchControls',
  components: { Multiselect },
  props     : {
                meetingName: { type: String, required: false }
              },
  i18n,
  data
}

function data(){
  return { options: [1,2,3,4,5,6,7,8,9] }
}

</script>

<style scoped>

</style>