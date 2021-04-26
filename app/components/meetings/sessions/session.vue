
<template >
  <div>
    <slot name="header"/>

    <div :class="bodyClass" :id="bodyId" >
      <table class="table table-striped table-hover no-border-first-row sessions">
        <tbody>
          <slot>
            <tr is="InterventionRow" v-for="(intervention, index) in interventions" :index="index+1" v-bind="{intervention}" :key="intervention._id"></tr>
          </slot>
        </tbody>
      </table>
    </div>
    
    <slot name="footer"/>
  </div>
</template>

<script>

import InterventionRow from './intervention-row.vue'

export default {
  name : 'SessionsView',
  components : { InterventionRow },
  props: { 
    bodyId:        { type: String, required: false, default: '' }, 
    bodyClass:     { type:[Array, String, Object], required: false, default: [] }, 
    interventions: { type: Array, required: false, default: [] }, 
  },

}
</script>