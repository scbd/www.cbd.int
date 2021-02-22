<template >
  <div>
    <Session :_id="_id" class="card" 
      :body-class="{'collapse':true, 'show': sessions.length==1 }" 
      :body-id="`sid${_id}`" 
      v-for="{ title, _id, interventions, startDate, videos } in sessions" :key="_id">

      <template v-slot:header>

        <div class="card-header" data-toggle="collapse" :data-target="`#sid${_id}`" :class="{ collapsed: sessions.length>1 }" >
          <h5> 
            {{ title }}
            <span v-if="!title" >{{ startDate | dateTimeFilter('cccc, d MMMM yyyy - T') }}</span>
            ({{interventions.length}})

            <i class="text-muted fa fa-caret-up"/>
            <i class="text-muted fa fa-caret-down"/>
            <i class="text-muted help">click to expand</i>

            <span class="video" v-if="videos.length">
              <VideoLink class="pull-right" :videos="videos" title="Full session webcast"/>
            </span>

          </h5>

        </div>
      </template>

      <InterventionRow v-for="(intervention, index) in interventions" v-bind="{intervention}" :index="index+1" v-bind:key="intervention._id">
        <template v-slot:controls>
          <div class="video">
            <VideoLink :videos="videos" :start-at="intervention.datetime" :title="`Start at intervention of ${intervention.title}`"/>
          </div>
        </template>
      </InterventionRow>

    </Session>

  </div>
</template>

<script>
import   Api     from '../api.js'
import   Session from './session.vue'
import   InterventionRow   from './intervention-row.vue'
import   VideoLink from './video-link.vue'
import { dateTimeFilter } from '../filters.js'

export default {
  name       : 'SessionsView',
  components : { Session, InterventionRow, VideoLink },
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

  sessions.forEach(s=>{
    const { date: startDate } = s;
    if(s.videos) s.videos = s.videos.map(v=>({ startDate, ...v })) // Set video startDate to session.date if not already set 
  });

  this.sessions = sessions.filter(o=>!!o.interventions.length);
}

</script>

<style scoped>

  .video ,
  .card-header .video { float: right; color: #404040; }
  .card-header .video { margin-right: -7px; }

  h5 { color: #009b48;}

  .card        { border: none; }
  .card-header { cursor: default; }

  .card-header           .fa-caret-up   { display: none; }
  .card-header.collapsed .fa-caret-up   { display: inline; }

  .card-header           .help          { display: none; font-weight: lighter; font-size: 80%; }
  .card-header.collapsed .help          { display: inline; }

  .card-header           .fa-caret-down { display: inline; }
  .card-header.collapsed .fa-caret-down { display: none; }
</style>
