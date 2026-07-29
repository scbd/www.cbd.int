<template >
  <div>
    <Session :_id="_id" class="card"
      :body-class="{'collapse':true, 'show': numberOfSessions==1 }"
      :body-id="`sid${_id}`"
      v-for="{ title, _id, interventions, date, videos, count, timezone, earlySubmission, cutoffDate, lastUpdated, refreshing, hasAiTranslations } in sessions" :key="_id">

      <template v-slot:header>

        <div class="card-header" data-toggle="collapse" :data-target="`#sid${_id}`" :class="{ collapsed: numberOfSessions>1 }"
          @click="!interventions && loadInterventions(_id)">
          <h5 :title="date | setTimezone(timezone) | format('z')">
            {{ title }}
            <span v-if="!title" >
              {{ date | setTimezone(timezone) | format('cccc, d MMMM yyyy - T') }}
            </span>
            ({{count}})
            
            <i v-if="_id=='pending'" class="text-muted fa fa-eye-slash" title="Visible to staff only"></i>
            <i class="text-muted fa fa-caret-up"/>
            <i class="text-muted fa fa-caret-down"/>
            <i class="text-muted help tiny">click to expand</i>
            <i v-if="!interventions" class="loading text-muted  fa fa-cog fa-spin"></i>
            

            <span class="video" v-if="videos && videos.length" @click.stop>
              <VideoLink class="pull-right" :videos="videos" title="Full session webcast"/>
            </span>

            <small v-if="isStaff && lastUpdated" class="text-muted tiny last-update" title="Auto-refreshed every minute">
              <i class="fa fa-refresh" :class="{ 'fa-spin': refreshing }" title="Refresh now"
                 @click.stop="!refreshing && loadInterventions(_id)"></i>
              last update {{ lastUpdated | format('T') }}
            </small>

            <br> 
            
            <small class="text-muted">
              <template v-if="earlySubmission && cutoffDate">
                <i>Early statement submissions - Deadline</i>: {{ cutoffDate | setTimezone(timezone) | format('cccc, d MMMM yyyy - T') }}
              </template>
              <template v-else>
                {{ date | setTimezone(timezone) | format('cccc, d MMMM yyyy - T') }}
              </template>
              <i class="tiny">{{ timezone }}</i>
            </small>
            
          </h5>

        </div>
      </template>

      <template v-slot:body-header>
        <div v-if="hasAiTranslations" class="alert alert-warning" role="alert">
          <i class="fa fa-language"></i>
          {{ $t('aiDisclaimerText') }}
        </div>
      </template>

      <template v-for="(intervention, index) in interventions">

        <InterventionRow v-bind="{intervention}" :timezone="timezone" :index="index+1" :key="intervention._id" :public-view="true" :show-ai-column="hasAiTranslations"
          @toggle="intervention.expanded = !intervention.expanded">
          <template v-slot:controls>
            <div class="video">
              <VideoLink :videos="videos" :start-at="intervention.datetime" :title="`Start at intervention of ${intervention.title}`"/>
            </div>
          </template>
        </InterventionRow>

        <InterventionRow v-for="(child, ci) in (intervention.expanded ? intervention.supersededChildren : [])"
          :intervention="child" :timezone="timezone" :sub-index="`${index+1}.${ci+1}`" :is-child="true" :key="child._id" :public-view="true" :show-ai-column="hasAiTranslations">
          <template v-slot:controls>
            <div class="video">
              <VideoLink :videos="videos" :start-at="child.datetime" :title="`Start at intervention of ${child.title}`"/>
            </div>
          </template>
        </InterventionRow>

      </template>

    </Session>

  </div>
</template>

<script>
import   Api, { mapObjectId, markSupersededInterventions } from '../api.js'
import   Session           from './session.vue'
import   InterventionRow   from './intervention-row.vue'
import   VideoLink         from './video-link.vue'
import   i18n              from '../locales.js'
import { format, timezone as setTimezone } from '../datetime.js'
import remapCode from './re-map.js'

const STAFF_ROLES = [ 'ScbdStaff', 'EditorialService' ]; // same definition of "staff" as documents.js

export default {
  name       : 'SessionsView',
  components : { Session, InterventionRow, VideoLink },
  props      : {
                  route:       { type: Object, required: false },
                  tokenReader: { type: Function, required: false }
                },
  computed   : { numberOfSessions, isStaff },
  filters    : { format, setTimezone },
  methods    : { loadInterventions, refreshOpenSessions },
  created, mounted, beforeDestroy, data,
  i18n,
}

function data(){
  return { 
    sessions: [],
    refreshTimer: null,
  }
}

async function created(){
  this.api = new Api(this.tokenReader);

  const meetingCode  = this.route.params.meeting;
  let   meeting      = await this.api.getMeetingByCode(meetingCode)
  const altMeetingId = remapCode(meeting._id)
  const sessions     = await this.api.querySessions({ s: { date: -1 }, q: { 'meetingIds': { $in : [mapObjectId(meeting._id), mapObjectId(altMeetingId)] }, count: { $gt: 0 } } });

  this.sessions = sessions.map(session => {
    const { date: startDate } = session;
    const videos = (session.videos||[]).map(v=>({ startDate, ...v })) // Set video startDate to session.date if not already set  
    return {
      ...session,
      videos,
      interventions     : null, //Make it reactive
      lastUpdated       : null, //Make it reactive
      refreshing        : false,//Make it reactive
      hasAiTranslations : false,//Make it reactive
    }
  });

  if(sessions.length==1) {
    const [ session ] = sessions; 
    this.loadInterventions(session._id)
  }

  //Inject virtual session with Pending Statement... for staff

  if(meeting._id != altMeetingId) //Rempap Meeting
    meeting = await this.api.getMeetingById(altMeetingId);

  const [pendingSession] = await this.api.queryInterventions({ q: { meetingId : mapObjectId(meeting._id), status:{ $ne: "public"} }, c:1 });

  if(pendingSession?.count){
    this.sessions.unshift({
      _id: 'pending',
      title: `${meeting.EVT_CD} - Pending statements`,
      count: pendingSession.count,
      meetingId: meeting._id,
      interventions     : null,
      lastUpdated       : null,
      refreshing        : false,
      hasAiTranslations : false,
    });
  }
}

function mounted(){
  this.refreshTimer = setInterval(this.refreshOpenSessions, 60 * 1000)
}

function beforeDestroy(){
  if(this.refreshTimer) clearInterval(this.refreshTimer)
}

// Staff follow live sessions; reload the ones the reader currently has expanded.
async function refreshOpenSessions(){
  if(!this.isStaff) return;

  const isExpanded = ({ _id }) => document.getElementById(`sid${_id}`)?.classList.contains('show');

  await Promise.all(this.sessions.filter(isExpanded).map(s => this.loadInterventions(s._id)));
}

async function loadInterventions(sessionId){

    const session = this.sessions.find(o=>o._id == sessionId);

    if(!session) return;

    let q = { sessionId: { $oid: sessionId }, status: "public" };
    let s = { datetime: 1 };

    if(session._id=='pending') {
      q = { meetingId : { $oid: session.meetingId }, status:{ $ne: "public"} };
      s = { agendaItem: 1, title:1 };
    }

    session.refreshing = true;

    try {
      const interventions = await this.api.queryInterventions({ q, s }) || [];

      // Superseded lineage only applies to early-submission sessions.
      session.interventions = session.earlySubmission
        ? markSupersededInterventions(interventions)
        : interventions;

      session.hasAiTranslations = hasAiTranslations(session.interventions);
      session.lastUpdated       = new Date();
    }
    catch(e) {
      console.error(e);
      session.interventions = session.interventions || []; // never leave the header spinning
    }
    finally { session.refreshing = false }
}

function numberOfSessions(){
  return this.sessions?.length || 0
}

// The Angular route resolves the user before this component is created.
function isStaff(){
  return !!this.$auth?.hasScope(STAFF_ROLES)
}

function hasTranslatedFile(intervention) {
  return intervention.files?.some(f => f.autoTranslated);
}

function hasAiTranslations(interventions) {
  return (interventions || []).some(i =>
    hasTranslatedFile(i) ||
    (i.supersededChildren || []).some(hasTranslatedFile))
}
</script>

<style scoped>

  .video ,
  .card-header .video { float: right; color: #404040; }
  .card-header .video { margin-right: -7px; }

  .card-header .last-update { float: right; margin-left: 10px; }
  .card-header .last-update .fa-refresh { cursor: pointer; }

  h5 { color: #009b48;}

  .card        { border: none; }

  /* Sticks while its own session is on screen, then the next header pushes it out. */
  .card-header { cursor: default; position: sticky; top: 0; z-index: 2; background-color: #f7f7f7; }

  .card-header           .fa-caret-up   { display: none; }
  .card-header.collapsed .fa-caret-up   { display: inline; }

  .card-header           .tiny          { font-weight: lighter; font-size: 80%; }
  .card-header           .help          { display: none; }
  .card-header.collapsed .help          { display: inline; }

  .card-header           .fa-caret-down { display: inline; }
  .card-header.collapsed .fa-caret-down { display: none; }
  .card-header.collapsed .loading       { display: none; }
</style>
