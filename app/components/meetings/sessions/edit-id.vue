<template >
  <div style="background: #eee;padding: 15px;">

    <div class="float-right" role="group">
      <button type="button" class="btn btn-danger" @click="remove" :disabled="loading || saving || isNew || statementCount > 0" :title="statementCount > 0 ? 'Sessions with statements cannot be deleted' : ''">Delete</button>
      &nbsp;&nbsp;
      <button type="button" class="btn btn-primary" @click="save" :disabled="loading || saving || errors.length > 0">
        <i v-if="saving" class="fa fa-cog fa-spin"></i> Save
      </button>
      <a class="btn btn-light" :href="listUrl()">Close</a>
    </div>

    <h1>
      {{ headerCode }} - {{ title || 'Meeting Session' }}
      <small v-if="isNew">(NEW)</small>
    </h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="loading" class="text-muted"><i class="fa fa-cog fa-spin"></i> Loading...</div>
    <div v-if="!loading && errors.length" class="text-danger mb-2"><small>{{ errors.join(' - ') }}</small></div>

    <div v-if="changeWarnings.length" class="alert alert-warning">
      <i class="fa fa-exclamation-triangle"></i> This session has {{ statementCount }} statement(s) attached. You are changing:
      <ul class="mb-0"><li v-for="w in changeWarnings" :key="w">{{ w }}</li></ul>
    </div>

    <form v-if="!loading && meetings.length" @submit.prevent="save" novalidate>

      <!-- Meetings -->
      <div class="form-group">
        <label class="control-label">Meeting(s)</label>
        <div class="form-check" v-for="{ _id, normalizedSymbol, EVT_TIT_EN } in meetings" :key="_id">
          <input class="form-check-input" type="checkbox" :id="`meeting-${_id}`" :value="_id" v-model="meetingIds" :disabled="saving">
          <label class="form-check-label" :for="`meeting-${_id}`"><b>{{ normalizedSymbol }}</b> - {{ EVT_TIT_EN }}</label>
        </div>
        <div v-if="otherMeetingIds.length" class="mt-1">
          <small class="text-muted">Other linked meetings (kept):</small>
          <span v-for="id in otherMeetingIds" :key="id" class="badge badge-secondary mr-1">{{ otherMeetingSymbol(id) }}</span>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-md-4">
          <!-- Date -->
          <div class="form-group">
            <label class="control-label" for="date">{{ earlySubmission ? 'Submissions open' : 'Date' }}</label>
            <input type="datetime-local" class="form-control" id="date" v-model="date" :disabled="saving">
          </div>
        </div>
        <div class="col-12 col-md-4">
          <!-- Timezone -->
          <div class="form-group">
            <label class="control-label" for="timezone">Timezone</label>
            <select class="form-control" id="timezone" v-model="timezone" :class="{ 'border-warning': isTimezoneMismatch }" :disabled="saving">
              <option v-for="{ value, text } in timezones" :key="value" :value="value">{{ text }}</option>
            </select>
            <small v-if="isTimezoneMismatch" class="text-warning">
              <i class="fa fa-exclamation-triangle"></i> Differs from the conference timezone ({{ conferenceTimezone }})
              <button type="button" class="btn btn-light btn-xs ml-1" @click="timezone = conferenceTimezone" :disabled="saving" title="Use the conference timezone"><i class="fa fa-undo"></i> Revert</button>
            </small>
          </div>
        </div>
      </div>

      <!-- Early statement submission -->
      <div class="panel panel-default mb-3">
        <div class="card-header d-flex align-items-center" :class="{ 'alert-success': earlySubmission }">
          <h4 style="color:inherit" class="mb-0">Early statement submission</h4>
          <div class="form-check ml-3">
            <input class="form-check-input" type="checkbox" id="earlySubmission" v-model="earlySubmission" :disabled="saving || (!earlySubmission && meetingIds.length !== 1)">
            <label class="form-check-label" for="earlySubmission">
              <span class="badge" :class="earlySubmission ? 'badge-success' : 'badge-secondary'">{{ earlySubmission ? 'Enabled' : 'Disabled' }}</span>
              <small class="text-muted">(one meeting only)</small>
            </label>
          </div>
        </div>

        <div class="card-body" v-if="earlySubmission && earlyMeeting">
          <div class="row">
            <div class="col-12 col-md-6">
              <!-- Agenda Item -->
              <div class="form-group">
                <label class="control-label" for="agendaItem">Agenda Item</label>
                <select class="form-control" id="agendaItem" v-model="agendaItem" :disabled="saving">
                  <option :value="null">Select an item......</option>
                  <option v-for="i in earlyMeeting.agenda.items" :key="i.item" :value="i.item" :disabled="hasSubItems(earlyMeeting.agenda.items, i.item)">{{ i.code || i.item }} - {{ i.shortTitle || i.title }}</option>
                </select>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <!-- Cutoff Date -->
              <div class="form-group">
                <label class="control-label" for="cutoffDate">Cutoff date <small class="text-muted">({{ timezone }})</small></label>
                <input type="datetime-local" class="form-control" id="cutoffDate" v-model="cutoffDate" :disabled="saving">
              </div>
            </div>
            <div class="col-12 col-md-2">
              <!-- Grace Period -->
              <div class="form-group">
                <label class="control-label" for="cutoffGracePeriod">Grace period</label>
                <div class="input-group">
                  <input type="number" min="0" step="1" class="form-control" id="cutoffGracePeriod" v-model.number="cutoffGracePeriod" :disabled="saving">
                  <div class="input-group-append"><span class="input-group-text">min</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <div class="form-group">
        <label class="control-label" for="title">Title</label>
        <div class="input-group">
          <input type="text" class="form-control" id="title" v-model="title" :disabled="saving">
          <div class="input-group-append">
            <button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" :disabled="saving">Generate <i class="fa fa-caret-down"></i></button>
            <div class="dropdown-menu dropdown-menu-right">
              <a v-for="label in titleLabels" :key="label" class="dropdown-item" :class="{ disabled: !checkedMeetings.length }" href="#" @click.prevent="checkedMeetings.length && setTitle(regularTitle(label))">{{ label }}</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" :class="{ disabled: !earlyTitle }" href="#" @click.prevent="earlyTitle && setTitle(earlyTitle)">Early submission</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="form-group">
        <label class="control-label" for="summary">Summary</label>
        <textarea class="form-control" id="summary" rows="3" v-model="summary" :disabled="saving"></textarea>
      </div>

      <!-- Videos -->
      <div class="panel panel-default mb-3">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h4 style="color:inherit" class="mb-0">Videos</h4>
          <button type="button" class="btn btn-light btn-sm" @click="addVideo" :disabled="saving"><i class="fa fa-plus"></i> Add video</button>
        </div>

        <div class="card-body">
          <div class="form-row mb-2" v-for="(video, index) in videos" :key="index">
            <div class="col-12 col-md-6">
              <input type="url" class="form-control" placeholder="URL" v-model="video.url" :disabled="saving">
            </div>
            <div class="col">
              <select class="form-control" v-model="video.type" :disabled="saving">
                <option v-for="{ value, text } in videoTypeOptions" :key="value" :value="value">{{ text }}</option>
              </select>
            </div>
            <div class="col">
              <select class="form-control" v-model="video.language" :disabled="saving">
                <option v-for="{ value, text } in languageOptions" :key="value" :value="value">{{ text }}</option>
              </select>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-light" @click="videos.splice(index, 1)" :disabled="saving"><i class="fa fa-times"></i></button>
            </div>
          </div>
          <small v-if="!videos.length" class="text-muted">No videos</small>
        </div>
      </div>

    </form>

    <div class="clearfix" v-if="!loading">
      <div class="float-right" role="group">
        <button type="button" class="btn btn-danger" @click="remove" :disabled="saving || isNew || statementCount > 0" :title="statementCount > 0 ? 'Sessions with statements cannot be deleted' : ''">Delete</button>
        &nbsp;&nbsp;
        <button type="button" class="btn btn-primary" @click="save" :disabled="saving || errors.length > 0">
          <i v-if="saving" class="fa fa-cog fa-spin"></i> Save
        </button>
        <a class="btn btn-light" :href="listUrl()">Close</a>
      </div>
    </div>
  </div>
</template>

<script>
import   Api, { mapObjectId } from '../api.js'
import { DateTime }           from 'luxon'
import { cloneDeep, sortBy, uniq, isEqual } from 'lodash'
import   remapCode            from './re-map.js'

const DATETIME_LOCAL = "yyyy-MM-dd'T'HH:mm";

const TITLE_LABELS = [ 'Plenary', 'Working Group I', 'Working Group II', 'High Level Segment' ];

// Eunomia reservation types that carry statements (same as the kronos statements sync)
const RESERVATION_TYPE_LABELS = {
  '570fd1ac2e3fa5cfa61d90f5': 'Plenary',
  '58379a233456cf0001550cac': 'Working Group I',
  '58379a293456cf0001550cad': 'Working Group II',
  '5aff32171a0ff600010c28a8': 'High Level Segment',
};

const VIDEO_PROVIDERS = [
  { type: 'unWebTv', priority: 0, test: url => /^https?:\/\/webtv\.un\.org\/([a-z]+\/)?asset\//i.test(url) },
  { type: 'youtube', priority: 1, test: url => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url) },
];

const VIDEO_TYPES = [ { value: 'unWebTv', text: 'UN Web TV' }, { value: 'youtube', text: 'YouTube' } ];
const LANGUAGES   = [
  { value: 'xx', text: 'All (floor)' },
  { value: 'ar', text: 'Arabic'  },
  { value: 'zh', text: 'Chinese' },
  { value: 'en', text: 'English' },
  { value: 'fr', text: 'French'  },
  { value: 'ru', text: 'Russian' },
  { value: 'es', text: 'Spanish' },
];

export default {
  name      : 'SessionEditId',
  props     : {
                route      : { type: Object,   required: false },
                tokenReader: { type: Function, required: false }
              },
  computed  : {
                isNew()       { return this.route.params.sessionId === 'new' },
                headerCode()  { return this.conference?.code || this.routeMeeting?.normalizedSymbol || '' },
                titleLabels() { return TITLE_LABELS },
                checkedMeetings,
                earlyMeeting,
                earlyTitle,
                conferenceTimezone,
                isTimezoneMismatch,
                timezones,
                videoTypeOptions() { return withLoadedValues(VIDEO_TYPES, this.videos.map(v=>v.type)) },
                languageOptions()  { return withLoadedValues(LANGUAGES,   this.videos.map(v=>v.language)) },
                statementCount,
                changeWarnings,
                errors,
              },
  watch     : { earlyTitle: onEarlyTitle },
  methods   : {
                load,
                loadSession,
                loadReservation,
                regularTitle,
                setTitle,
                otherMeetingSymbol,
                hasSubItems,
                addVideo,
                save,
                findOverlappingSessions,
                remove,
                listUrl,
              },
  data, created
}

function data(){
  return {
    loading          : true,
    saving           : false,
    error            : null,
    conference       : null,
    routeMeeting     : null,
    meetings         : [],
    session          : null,
    title            : '',
    summary          : '',
    date             : '',
    timezone         : '',
    meetingIds       : [],
    otherMeetingIds  : [],
    earlySubmission  : false,
    agendaItem       : null,
    cutoffDate       : '',
    cutoffGracePeriod: 0,
    videos           : [],
  }
}

async function created(){
  this.api = new Api(this.tokenReader);

  try     { await this.load() }
  catch(e){ this.error = e.message || `${e}` }
  finally { this.loading = false }
}

async function load(){
  const { code, meeting, sessionId, reservationId } = this.route.params;

  const session = await getSession(this.api, this.isNew ? reservationId : sessionId);

  if(this.isNew && session) return window.location.replace(`${this.listUrl()}/${encodeURIComponent(session._id)}/edit`);
  if(!this.isNew && !session) throw new Error('Session not found');

  if(code) {
    this.conference = await this.api.getConference(remapCode(code));
    if(!this.conference) throw new Error('Conference not found');
  }
  else {
    this.routeMeeting = await this.api.getMeetingByCode(remapCode(meeting));
    if(!this.routeMeeting) throw new Error('Meeting not found');
    this.conference = await this.api.getConferenceByMeetingId(this.routeMeeting._id) || null;
  }

  if(this.conference) {
    const meetings = await Promise.all(this.conference.MajorEventIDs.map(remapCode).map(id=>this.api.getMeetingById(id)));
    this.meetings  = meetings.filter(o=>!!o);
  }
  else {
    this.meetings = [ this.routeMeeting ];
  }

  if(session) return this.loadSession(session);

  this.timezone   = this.conferenceTimezone || '';
  this.meetingIds = this.routeMeeting ? [ this.routeMeeting._id ] : [];

  if(reservationId) await this.loadReservation(await this.api.getReservation(reservationId));
}

function loadSession(session){
  const listIds = this.meetings.map(m=>m._id);
  const ids     = session.meetingIds || [];

  this.session           = session;
  this.title             = session.title   || '';
  this.summary           = session.summary || '';
  this.timezone          = session.timezone;
  this.date              = toLocal(session.date, session.timezone);
  this.meetingIds        = ids.filter(id=> listIds.includes(id));
  this.otherMeetingIds   = ids.filter(id=>!listIds.includes(id));
  this.earlySubmission   = !!session.earlySubmission;
  this.agendaItem        = session.agendaItem ?? null;
  this.cutoffDate        = toLocal(session.cutoffDate, session.timezone);
  this.cutoffGracePeriod = session.cutoffGracePeriod ?? 0;
  this.videos            = cloneDeep(session.videos || []);
}

// Pre-fill a new session from an Eunomia reservation, the same way the kronos statements sync does
function loadReservation(reservation){
  if(!reservation) throw new Error('Reservation not found');

  if(this.conference && reservation.location?.conference !== this.conference._id)
    throw new Error('Reservation belongs to another conference');

  const { agenda = {} } = reservation;
  const ids = agenda.meetingIds?.length
            ? agenda.meetingIds.map(remapCode)
            : Object.keys(agenda.meetings || {}).map(code=>this.meetings.find(m=>m.normalizedSymbol === remapCode(code).toUpperCase())?._id);

  const meetingIds = ids.filter(id=>this.meetings.some(m=>m._id === id));
  const label      = RESERVATION_TYPE_LABELS[reservation.type];

  if(meetingIds.length) this.meetingIds = meetingIds;

  this.date    = toLocal(reservation.start, this.timezone);
  this.summary = (reservation.title || '').replace(/^[\s:]*/, '').trim();
  this.videos  = toVideos(reservation.links);

  if(label) this.title = this.regularTitle(label);
}

function checkedMeetings(){
  return this.meetings.filter(m=>this.meetingIds.includes(m._id));
}

function earlyMeeting(){
  return this.checkedMeetings.length === 1 && this.checkedMeetings[0].agenda ? this.checkedMeetings[0] : null;
}

function earlyTitle(){
  if(!this.earlySubmission || !this.earlyMeeting) return null;

  const item = this.earlyMeeting.agenda.items.find(i=>i.item === this.agendaItem);

  if(!item) return null;

  return `${this.earlyMeeting.normalizedSymbol} – Item ${item.code || item.item}: ${item.shortTitle || item.title} – Advance Statement Submissions`;
}

function onEarlyTitle(earlyTitle){
  if(earlyTitle && !this.title.trim()) this.setTitle(earlyTitle);
}

function regularTitle(label){
  return `${this.checkedMeetings.map(m=>m.normalizedSymbol).join(' / ')} - ${label}`;
}

function setTitle(title){
  this.title = title;

  if(this.isNew && title === this.earlyTitle && !this.summary.trim()) this.summary = title;
}

function conferenceTimezone(){
  return this.conference?.timezone || this.routeMeeting?.timezone;
}

function isTimezoneMismatch(){
  return !!this.conferenceTimezone && !!this.timezone && this.timezone !== this.conferenceTimezone;
}

// The browser list only has canonical zones (no America/Montreal), so the values in use are always added.
// Offsets are taken at the session date, so they follow daylight saving time.
function timezones(){
  const zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];
  const at    = this.date || DateTime.now().toFormat(DATETIME_LOCAL);

  return sortBy(uniq([ ...zones, this.timezone, this.conferenceTimezone ].filter(o=>!!o))).map(value=>({
    value,
    text: `${value.replace(/_/g, ' ')} (${DateTime.fromISO(at, { zone: value }).toFormat('ZZ')})`,
  }));
}

function statementCount(){
  return Math.max(this.session?.count || 0, this.session?.totalCount || 0);
}

function changeWarnings(){
  if(!this.session) return [];

  const { session } = this;
  const warnings    = [];
  const meetingIds  = [ ...this.meetingIds, ...this.otherMeetingIds ];

  if(!!session.earlySubmission !== this.earlySubmission)
    warnings.push(this.earlySubmission ? 'Early submission activated' : 'Early submission removed');

  if(session.earlySubmission && this.earlySubmission && (session.agendaItem ?? null) !== this.agendaItem)
    warnings.push('Agenda item');

  if(!isEqual(sortBy(session.meetingIds || []), sortBy(meetingIds)))
    warnings.push('Meetings');

  return warnings;
}

function errors(){
  const errors = [];

  if(!this.title.trim())          errors.push('Title is required');
  if(!this.date)                  errors.push('Date is required');
  if(!this.timezone)              errors.push('Timezone is required');
  if(!this.meetingIds.length)     errors.push('Select at least one meeting');

  if(this.earlySubmission) {
    const grace = this.cutoffGracePeriod;

    if(this.meetingIds.length !== 1)                   errors.push('Early submission requires exactly one meeting');
    if(this.agendaItem === null)                       errors.push('Agenda item is required');
    if(!this.cutoffDate)                               errors.push('Cutoff date is required');
    else if(this.date && this.cutoffDate <= this.date) errors.push('Cutoff date must be after the submissions open date');
    if(!Number.isInteger(grace) || grace < 0)          errors.push('Grace period must be 0 or more minutes');
  }

  return errors;
}

function otherMeetingSymbol(id){
  return (this.session?.meetings || []).find(m=>m._id === id)?.symbol || id;
}

// Sub-items carry a fractional number (6.1, 6.2) under their parent (6), which is then only a heading
function hasSubItems(items, item){
  return items.some(i => Math.floor(i.item) == item && i.item != item);
}

function addVideo(){
  this.videos.push({ url: '', type: VIDEO_TYPES[0].value, language: 'xx' });
}

async function save(){
  if(this.errors.length) return;

  if(this.changeWarnings.length && !confirm(`This session has ${this.statementCount} statement(s) attached.\nYou are changing: ${this.changeWarnings.join(', ')}.\n\nContinue?`)) return;

  this.saving = true;
  this.error  = null;

  try {
    if(this.earlySubmission) {
      const overlapping = await this.findOverlappingSessions();

      if(overlapping.length && !confirm(`Another early submission session exists for this agenda item with an overlapping period:\n${overlapping.map(s=>s.title).join('\n')}\n\nContinue?`)) return;
    }

    const { interventions, ...original } = this.session || {};
    const early = this.earlySubmission;

    const session = {
      ...original,
      conferenceId     : this.conference ? this.conference._id : original.conferenceId,
      meetingIds       : [ ...this.meetingIds, ...this.otherMeetingIds ],
      title            : this.title.trim(),
      summary          : this.summary.trim(),
      date             : toUtc(this.date, this.timezone),
      timezone         : this.timezone,
      videos           : this.videos.filter(v=>(v.url||'').trim()).map(v=>({ ...v, url: v.url.trim() })),
      earlySubmission  : early,
      agendaItem       : early ? this.agendaItem                          : null,
      cutoffDate       : early ? toUtc(this.cutoffDate, this.timezone)    : null,
      cutoffGracePeriod: early ? this.cutoffGracePeriod                   : null,
    };

    if(this.isNew) await this.api.createSession(session, this.route.params.reservationId || null);
    else           await this.api.updateSession(this.session._id, session);

    window.location.href = this.listUrl();
  }
  catch(e) {
    this.error = e.message || `${e}`;
  }
  finally {
    this.saving = false;
  }
}

async function findOverlappingSessions(){
  const q = {
    earlySubmission: true,
    agendaItem     : this.agendaItem,
    meetingIds     : { $in: [ mapObjectId(this.earlyMeeting._id) ] },
  };

  const sessions = await this.api.querySessions({ q, f: { title: 1, date: 1, cutoffDate: 1 } }) || [];
  const from     = new Date(toUtc(this.date,       this.timezone));
  const to       = new Date(toUtc(this.cutoffDate, this.timezone));

  return sessions.filter(s=>s._id !== this.session?._id && new Date(s.date) < to && new Date(s.cutoffDate) > from);
}

async function remove(){
  if(!confirm(`Delete session "${this.session.title}"?`)) return;

  this.saving = true;
  this.error  = null;

  try {
    await this.api.deleteSession(this.session._id);

    window.location.href = this.listUrl();
  }
  catch(e) {
    this.error = e.message || `${e}`;
  }
  finally {
    this.saving = false;
  }
}

function listUrl(){
  const { code, meeting } = this.route.params;

  if(meeting) return `/meetings/${encodeURIComponent(meeting)}/sessions`;
  else        return `/conferences/${encodeURIComponent(code)}/sessions`;
}

//////////////////////////
// Helpers
////////////////////////

async function getSession(api, sessionId){
  if(!sessionId) return null;

  try {
    const { interventions, ...session } = await api.getSessionById(sessionId);

    return session;
  }
  catch(e) {
    if(e?.statusCode === 404) return null;
    throw e;
  }
}

function toLocal(isoDate, timezone){
  if(!isoDate) return '';

  return DateTime.fromISO(isoDate, { zone: 'utc' }).setZone(timezone || 'local').toFormat(DATETIME_LOCAL);
}

function toUtc(localDate, timezone){
  return DateTime.fromISO(localDate, { zone: timezone }).toUTC().toISO();
}

function toVideos(links){
  const lookup = url => VIDEO_PROVIDERS.find(({ test }) => test(url));

  const videos = (links || []).filter(({ url }) => lookup(url)).map(({ url, locale }) => ({
    url,
    type    : lookup(url).type,
    language: locale || 'xx',
  }));

  return sortBy(videos, [ v => lookup(v.url).priority, 'language' ]);
}

// Values no longer offered (e.g. legacy 'live' video type) are kept as options so they are not lost on save
function withLoadedValues(options, values){
  const extra = uniq(values).filter(v=>v && !options.some(o=>o.value === v));

  return [ ...options, ...extra.map(value=>({ value, text: value.charAt(0).toUpperCase() + value.slice(1) })) ];
}
</script>
