<template >
  <div>
    <Session class="card" 
      :body-class="{'collapse':true, 'show': sessions.length==1 }" 
      :body-id="`sid${_id}`" 
      v-for="{ title, _id, interventions, startDate } in sessions" :interventions="interventions" :key="_id">

      <template slot="header">

        <div class="card-header" data-toggle="collapse" :data-target="`#sid${_id}`" :class="{ collapsed: sessions.length>1 }" >
          <h5> 
            {{ title }}
            <span v-if="!title" >{{ startDate | dateTimeFilter('cccc, d MMMM yyyy - T') }}</span>
            ({{interventions.length}})

            <i class="text-muted fa fa-caret-up"/>
            <i class="text-muted fa fa-caret-down"/>
            <i class="text-muted help">click to expand</i>
          </h5>
        </div>

      </template>

    </Session>

  </div>
</template>

<script>
import   Api               from '../api.js'
import   Session           from './session.vue'
import { dateTimeFilter  } from '../filters.js'

export default {
  name       : 'SessionsView',
  components : { Session },
  props      : { 
                  route:       { type: Object, required: false },
                  tokenReader: { type: Function, required: false }
                },
  filters : { dateTimeFilter },
  created, data
}

function data(){
  return { 
    sessions: [],
  }
}

async function created(){
  this.api = new Api(this.tokenReader);

  const sessions = await this.api.getSessions(this.route.params.meeting);

  this.sessions = sessions.filter(o=>!!o.interventions.length);
}

</script>

<style scoped>

  h5 { color: #009b48;}

  .card-header { cursor: default; }

  .card-header           .fa-caret-up   { display: none; }
  .card-header.collapsed .fa-caret-up   { display: inline; }

  .card-header           .help          { display: none; font-weight: lighter; font-size: 80%; }
  .card-header.collapsed .help          { display: inline; }

  .card-header           .fa-caret-down { display: inline; }
  .card-header.collapsed .fa-caret-down { display: none; }
</style>