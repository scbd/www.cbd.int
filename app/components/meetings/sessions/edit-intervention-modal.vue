<template>

    <div class="modal-content-upload">
        <!-- Modal -->
        <div class="modal fade" id="editIntervention" ref="editIntervention" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="uploadModalLabel">
                            <i class="fa fa-edit"></i> Edit Intervention 
                        </h4>
                        <button  type="button" class="close" aria-label="Close" @click="close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        
                        <form  id="statement-submission-form" @submit.prevent="submitForm" ref="form" novalidate :class="{ 'was-validated': wasValidated }">

                            <div class="form-group row" v-if="!intervention._id">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Search</label>
                                <div class="col-sm-9">
                                    <OrganizationSearch :disabled="!!progress" :meetings="meetings" :tokenReader="tokenReader" @change="onOrganizationChange"/>
                                </div>
                            </div> 

                            <div class="form-group row">
                                <label for="participantIdentity" class="col-sm-3 col-form-label">Country / Organization </label>
                                <div class="col-sm-9">
                                    <input :disabled="!!progress" type="text"  class="form-control" id="title" ref="title" v-model.trim="title" required>
                                </div>
                            </div> 

                            <div class="form-group row">
                                <label for="organizationTypeId" class="col-sm-3 col-form-label">Type</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress" class="form-control" id="organizationTypeId"  v-model="organizationTypeId" required>
                                        <option v-for="{ _id, acronym, title } in organizationTypes" :key="_id" :value="_id">{{acronym}} - {{ title }} </option>
                                    </select>
                                    <div class="invalid-feedback">Please select a an organization type.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="agendaItem" class="col-sm-3 col-form-label">Agenda Item</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress" class="form-control" id="agendaItem"  v-model="agendaItem" required>
                                        <optgroup v-for="{ _id: meetingId, agenda, normalizedSymbol } in meetings" :key="meetingId" :label="normalizedSymbol">
                                            <option v-for="{ item, shortTitle, title } in agenda.items" :key="item" :value="{ meetingId, item }">{{item }} - {{ shortTitle || title }} </option>
                                        </optgroup>
                                    </select>
                                    <div class="invalid-feedback">Please select a an agenda item.</div>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="status" class="col-sm-3 col-form-label">Status</label>
                                <div class="col-sm-9">
                                    <select :disabled="!!progress || !canUpdateStatus" class="form-control" id="types" v-model="status">
                                        <option value="public">Delivered</option>
                                        <option value="pending" selected>Uploaded / Pending</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Move to Session -->
                            <div class="form-group row" v-if="canMove">
                                <label class="col-sm-3 col-form-label">Session</label>
                                <div class="col-sm-9">
                                    <div class="input-group">
                                        <!-- Read-only display when not editing -->
                                        <input v-if="!moveEnabled" type="text" class="form-control" readonly
                                               :value="currentSessionDisplay" />

                                        <!-- Editable select when enabled -->
                                        <select v-else :disabled="!!progress || sessionsLoading"
                                                class="form-control" v-model="selectedSessionId">
                                            <option v-if="sessionsLoading" disabled value="">Loading sessions...</option>
                                            <option v-if="sessionsError" disabled value="">Error loading sessions</option>
                                            <option v-for="session in availableSessions" :key="session._id"
                                                    :value="session._id">
                                                {{ formatSessionOption(session) }}{{ session._id === sessionId ? ' (current)' : '' }}
                                            </option>
                                        </select>

                                        <!-- Pencil edit button -->
                                        <div class="input-group-append">
                                            <button type="button" class="btn btn-outline-secondary"
                                                    :disabled="!!progress"
                                                    @click="toggleMoveEnabled"
                                                    :title="moveEnabled ? 'Cancel move' : 'Move to different session'">
                                                <i :class="moveEnabled ? 'fa fa-times' : 'fa fa-pencil'"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <small class="form-text text-warning" v-if="moveEnabled && sessionHasChanged">
                                        <i class="fa fa-exclamation-triangle"></i> Intervention will be moved when you save.
                                    </small>
                                </div>
                            </div>

                            <div class="form-group row">
                                <label for="status" class="col-sm-3 col-form-label">Date / Time</label>
                                <div class="col-sm-9">
                                    <DateTimeSelector :disabled="!!progress" v-model="datetime" :timezone="timezone"/>
                                </div>
                            </div>       

                            <h5>Files</h5>
                            <hr>

                            <div v-for="row in fileRows" :key="row.key" class="form-group row border-bottom pb-2">

                                <template v-if="row.file">
                                    <label v-if=" row.file._id" class="col-sm-3 col-form-label" :title="row.file.filename">
                                        <a :href="row.file.url" target="_blank">{{row.file.filename}} <i class="fa fa-external-link" aria-hidden="true"></i></a>
                                    </label>
                                    <input :disabled="!!progress" v-if="!row.file._id" type="file" class="col-sm-3 col-form-label" @change="onFileSelect(row.file, $event)" ref="file">
                                </template>

                                <div v-else class="col-sm-3 col-form-label">
                                    <div v-if="row.requestable" class="form-check form-check-inline">
                                        <input :disabled="!!progress" type="checkbox" class="form-check-input"
                                               :id="`request-${row.lang}`" :value="row.lang" v-model="requestedLangs">
                                        <label class="form-check-label" :for="`request-${row.lang}`">Request</label>
                                    </div>
                                    <button v-if="row.removable" :disabled="!!progress" type="button" class="btn btn-sm btn-link p-0"
                                            title="Do not request this language" @click="removeLanguage(row.lang)"><i class="fa fa-times"></i></button>
                                    <span v-if="row.label" class="badge align-middle" :class="row.badgeClass">{{ row.label }}</span>
                                </div>

                                <div class="col-sm-3">
                                    <div class="input-group">
                                        <span v-if="row.status!='nonAutoTranslate'" class="form-control-plaintext">
                                            <i class="fa fa-language"></i> {{ languageName(row.lang) }}
                                        </span>
                                        <select v-else class="form-control" :id="`fileLanguage-${row.key}`" v-model="row.file.language"
                                                :disabled="!!progress || hasTranslations"
                                                :title="hasTranslations ? 'Locked: automatic translations are derived from this language' : ''">
                                            <option value="ar">العربية</option>
                                            <option value="en" selected>English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="ru">Русский</option>
                                            <option value="zh">中文</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-sm-5">
                                    <div v-if="row.file" class="input-group">
                                        <div class="form-check">
                                            <input :disabled="!!progress || !row.file.allowPublic"  type="checkbox" class="form-check-input" :id="`public-${row.key}`" v-model="row.file.public" >
                                            <label class="form-check-label" :for="`public-${row.key}`">Visible on website
                                                <i v-if="!row.file.public" class="fa fa-eye-slash text-muted"></i>
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input :disabled="!!progress || !!row.file._id"  type="checkbox" class="form-check-input" :id="`allowPublic-${row.key}`" v-model="row.file.allowPublic" >
                                            <label class="form-check-label" :for="`allowPublic-${row.key}`">Participant allowed publication</label>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <div v-if="row.requestable" class="form-check"
                                             :title="sourceAllowsPublic ? '' : 'Participant did not allow publication'">
                                            <input :disabled="!!progress || !sourceAllowsPublic" type="checkbox" class="form-check-input"
                                                   :id="`public-${row.key}`" :checked="row.public"
                                                   @change="requestPublic[row.lang] = $event.target.checked">
                                            <label class="form-check-label" :for="`public-${row.key}`">Visible on website
                                                <i v-if="!row.public" class="fa fa-eye-slash text-muted"></i>
                                            </label>
                                        </div>
                                        <div class="col-form-label text-muted">
                                            <div :title="row.message">{{ row.message }}</div>
                                            <small v-if="row.willRequest" class="font-italic">
                                                <i class="fa fa-exclamation-circle"></i> Translations are requested when you save.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group row" v-if="sourceFile && missingLangs.length">
                                <div class="col-12">
                                    <div class="btn-group btn-group-sm">
                                        <button type="button" class="btn btn-light" :disabled="!!progress" @click="addAllLanguages">
                                            <i class="fa fa-language"></i> Add all languages
                                        </button>
                                        <button type="button" class="btn btn-light dropdown-toggle dropdown-toggle-split"
                                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" :disabled="!!progress">
                                            <i class="fa fa-caret-down"></i>
                                            <span class="sr-only">Add a language</span>
                                        </button>
                                        <div class="dropdown-menu">
                                            <a v-for="lang in missingLangs" :key="lang" class="dropdown-item" href="#" @click.prevent="addLanguage(lang)">
                                                {{ languageName(lang) }}
                                            </a>
                                        </div>
                                    </div>
                                    <button v-if="canAddEnglishForStaff" type="button" class="btn btn-light btn-sm ml-2"
                                            :disabled="!!progress" @click="addEnglishForStaff"
                                            title="Request an English translation for internal use - not visible on the website">
                                        <i class="fa fa-eye-slash"></i> Add English for staff
                                    </button>
                                </div>
                            </div>

                            <div class="alert alert-warning" role="alert" v-if="error">
                                <span>{{error.message||'Unknown error'}}</span>
                            </div> 
                           
                        </form>  
                    </div>
                
                    <div class="modal-footer">
                        <div v-if="intervention.meta" class="w-100">
                            <small v-if="intervention.meta.createdBy">
                                Created by 
                                <a 
                                    v-if="isKronosUser(intervention.meta.createdBy.id)"
                                    :href="`https://cbd.kronos-events.net/organizations/000000000000000000000000/contacts/${encodeURIComponent(intervention.meta.createdBy.id)}`"
                                    target="_blank">{{ intervention.meta.createdBy.name }}</a>
                                <span v-else>{{ intervention.meta.createdBy.name }}</span> 
                                on {{ formatDate(intervention.meta.createdOn, 'yyyy-LL-dd HH:mm:ss') }}
                            </small><br />
                            <small v-if="intervention.meta.createdBy.id">
                                Updated by
                                <a 
                                    v-if="isKronosUser(intervention.meta.updatedBy.id)"
                                    :href="`https://cbd.kronos-events.net/organizations/000000000000000000000000/contacts/${encodeURIComponent(intervention.meta.updatedBy.id)}`"
                                    target="_blank">{{ intervention.meta.updatedBy.name }}</a>
                                <span v-else>{{ intervention.meta.updatedBy.name }}</span> 
                                on {{ formatDate(intervention.meta.updatedOn, 'yyyy-LL-dd HH:mm:ss') }}
                            </small>
                        </div>
                        <i v-if="!!progress" class="fa fa-cog fa-spin"></i>
                        <button v-if=" canPublish" :disabled="!!progress" type="submit" class="btn btn-success" @click="save(true)"><i class="fa fa-microphone"></i> <span>Publish</span></button>
                        <button v-if="!canPublish" :disabled="!!progress" type="submit" class="btn btn-primary" @click="save()"><i class="fa fa-save"></i> <span>Save</span></button>
                        <button :disabled="!!progress" type="button" class="btn btn-default" @click="close()"><i class="fa fa-power-off"></i> <span>Close</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { cloneDeep } from 'lodash'
import $    from 'jquery';
import Api, { mapObjectId }  from '../api.js'
import OrganizationSearch from './organization-search.vue'
import DateTimeSelector   from './datetime-selector.vue'
import { format as formatDate, timezone, asDateTime } from '../datetime.js'
import { UN, getLanguageName as languageName } from '~/data/languages'

// A freshly requested translation is left alone: `Request` only reappears on a pending row once the
// entry is older than this.
const PENDING_GRACE_MS = 5 * 60 * 1000;

const capitalize = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export default {
    name: 'uploadStatement',
    components: { OrganizationSearch, DateTimeSelector },
    props: { 
        tokenReader  : { type: Function, required: false },
        route        : { type: Object,   required: false },
        intervention : { type: Object,   required: true  },
        sessionId    : { type: String,   required: false },
        timezone     : { type: String,   required: false },
        meetings     : { type: Array,    required: false },
        action       : { type: String,   required: false, default: "edit" },
    },
    data:  function(){
        return {
            interventionId :     this.intervention._id,
            title :              this.intervention.title,
            organizationTypeId : this.intervention.organizationTypeId,
            status:              this.intervention.status,
            organizationId:      this.intervention.organizationId,
            government:          this.intervention.government,
            datetime:            this.datetime || this.intervention.datetime || new Date(),
            files:               cloneDeep(this.intervention.files||[]),
            agendaItem:          { meetingId : this.intervention.meetingId, item: this.intervention.agendaItem },
            organizationTypes  : [],
            organization : null,
            progress: null,
            error : null,
            // Automatic translations
            translations:   { ...(this.intervention.translations||{}) },
            addedLangs:     [],   // languages added from the dropdown - extra rows, no file
            requestedLangs: [],   // the ticked set, across every requestable row
            // `Visible on website` per requestable language - every language is seeded so v-model
            // stays reactive, and a request defaults to public.
            requestPublic:  Object.fromEntries(Object.keys(UN).map(lang => [lang, true])),
            now:            Date.now(),
            // Move intervention functionality
            availableSessions: [],
            selectedSessionId: this.sessionId,
            moveEnabled: false,
            sessionsLoading: false,
            sessionsError: null,
        }
    },
    computed: { fileRows, sourceFile, sourceAllowsPublic, missingLangs, canAddEnglishForStaff, langsToRequest, hasTranslations, canUpdateStatus, canPublish, canMove, sessionHasChanged, currentSessionDisplay },
    methods: { open, close, clearError, save, onOrganizationChange, isKronosUser, formatDate, languageName, loadAvailableSessions, formatSessionOption, toggleMoveEnabled,
               liveEntry, buildRequestRow, onFileSelect, addLanguage, addAllLanguages, addEnglishForStaff, removeLanguage, requestTranslations },
    created,
    mounted,
    beforeDestroy,
}

async function created() {
  this.api = new Api(this.tokenReader)

  if(this.action=='publish') {
      this.datetime = new Date();
      this.status   = 'public';
      this.files.forEach(f => {
          f.public = !!f.allowPublic;
      });
  }

  this.organizationTypes = await this.api.getInterventionOrganizationTypes();
}

function mounted(){
  $('[data-toggle="tooltip"]').tooltip();
  this.open();

  // Keeps `requested N ago` and the 5-minute pending grace live while the modal sits open.
  this.timer = setInterval(() => { this.now = Date.now() }, 30000);
}

function beforeDestroy(){
  clearInterval(this.timer);
}

function open() { 
  $(this.$refs.editIntervention).modal('show') 
}

function close(intervention){ 
  $(this.$refs.editIntervention).modal('hide');
  this.$emit('close', intervention) 
}

// The file translations are derived from. The `htmlFile` arm makes the languages available on a
// brand-new intervention as soon as a file is picked - save() resolves the real id after upload.
function sourceFile() {
    return this.files.find(f => !f.autoTranslated && (f._id || f.htmlFile)) || null;
}

// A translation inherits the source file's publication permission: mapFileData() already clamps a
// file's `public` to its `allowPublic`, so a request must not ask for more than the original allows.
function sourceAllowsPublic() {
    return !!(this.sourceFile && this.sourceFile.allowPublic);
}

// Display order only - `files` keeps its server order so save() is unaffected. Virtual rows never
// enter `files`; they exist here alone.
function fileRows() {
    const byLanguage = (a, b) => (a.language||'').localeCompare(b.language||'');

    const humanFiles = this.files.filter(f => !f.autoTranslated);
    const rows       = humanFiles.map((file, i) => ({
        key: file._id || `new:${i}`, lang: file.language, status: 'nonAutoTranslate', file,
    }));

    if(!this.sourceFile) return rows;

    for(const file of this.files.filter(f => f.autoTranslated).sort(byLanguage))
        rows.push({ key: file._id, lang: file.language, status: 'done', file });

    const humanLangs = humanFiles.map(f => f.language);
    const aiLangs    = this.files.filter(f => f.autoTranslated).map(f => f.language);

    for(const lang of Object.keys(UN)) {
        const entry = this.liveEntry(lang);

        if(humanLangs.includes(lang) || aiLangs.includes(lang)) continue;
        if(!entry && !this.addedLangs.includes(lang))           continue;

        rows.push(this.buildRequestRow(lang, entry));
    }

    return rows;
}

// A `done` entry whose file is gone was deleted on purpose, so the entry is ignored outright: the
// language reads as untranslated, returns to the dropdown, and stops locking the source language.
function liveEntry(lang) {
    const entry = this.translations[lang];

    if(!entry) return null;

    if(entry.status === 'done' && !this.files.some(f => f.language === lang && f.autoTranslated))
        return null;

    return entry;
}

// A language holding a human-submitted file is never requestable: gaia supersedes an existing file
// of the same language and contentType, so requesting it would soft-delete the delegation's own
// upload. Same for the source language itself, which gaia rejects outright - and the select stays
// editable until AI files exist, so it can change under a row that was already ticked.
function buildRequestRow(lang, entry) {

    const requested = entry && entry.updatedOn && asDateTime(entry.updatedOn);
    const isPending = entry && entry.status === 'pending';

    let label      = 'Error';
    let message    = (entry && entry.error) || '';
    let requestable = true;

    if(!entry) {
        label   = '';
        message = '';
    }
    else if(isPending) {
        label       = 'Pending';
        message     = requested ? `requested ${requested.toRelative()}` : '';
        requestable = !!requested && (this.now - requested.toMillis()) > PENDING_GRACE_MS;
    }
    else if(entry.status !== 'failed') {
        label = capitalize(entry.status);
    }

    requestable = requestable && lang !== this.sourceFile.language;

    return {
        key    : `lang:${lang}`,
        lang,
        status : entry ? (isPending ? 'pending' : 'error') : 'added',
        file   : null,
        label,
        badgeClass : isPending ? 'badge-light' : 'badge-danger',
        message,
        requestable,
        willRequest: requestable && this.requestedLangs.includes(lang),
        removable  : !entry,
        public     : !!(this.requestPublic[lang] && this.sourceAllowsPublic),
    };
}

// `missingLangs` already encodes every condition the button needs: it is empty without a source
// file, and it excludes the source language itself along with any language that already holds a
// file or a translation entry - so English being in it means there is no English version to clash
// with. It also drops out once the row has been added.
function canAddEnglishForStaff() {
    return this.missingLangs.includes('en');
}

function missingLangs() {
    if(!this.sourceFile) return [];

    return Object.keys(UN).filter(lang => lang !== this.sourceFile.language
                                      && !this.liveEntry(lang)
                                      && !this.addedLangs.includes(lang)
                                      && !this.files.some(f => f.language === lang));
}

// The single choke point for what can be posted: `willRequest` is set on the row itself, already
// gated on `requestable`, so a language protected by a human file, a still-fresh pending, or the
// current source language can never be sent even if it lingers in `requestedLangs`.
function langsToRequest() {
    return this.fileRows.filter(r => r.willRequest).map(r => ({ lang: r.lang, public: r.public }));
}

// $set, not assignment: `htmlFile` is absent from a seeded file row, and `sourceFile` - which gates
// the language dropdown - has to react to the pick.
function onFileSelect(file, event) {
    this.$set(file, 'htmlFile', event.target.files[0]);
}

function addLanguage(lang) {
    if(!this.addedLangs.includes(lang))     this.addedLangs.push(lang);
    if(!this.requestedLangs.includes(lang)) this.requestedLangs.push(lang);
}

function addAllLanguages() {
    this.missingLangs.forEach(this.addLanguage);
}

// Same row the dropdown's `English` entry produces, but hidden from the website: the secretariat
// reads it internally. The checkbox stays editable, so it can still be published from the row.
function addEnglishForStaff() {
    this.addLanguage('en');
    this.requestPublic.en = false;
}

function removeLanguage(lang) {
    this.addedLangs     = this.addedLangs    .filter(l => l !== lang);
    this.requestedLangs = this.requestedLangs.filter(l => l !== lang);
}

// Translations are derived from the source language, so it locks as soon as any exist - a produced
// file, an entry gaia is still working on, or a row about to be requested on save. Changing it would
// leave `intervention.translations` keyed off a language that no longer exists.
function hasTranslations() {
    return this.files.some(f => f.autoTranslated)
        || Object.keys(UN).some(lang => !!this.liveEntry(lang))
        || this.addedLangs.length > 0;
}

function canUpdateStatus() {
    return this.sessionId &&
         (!this.intervention._id || this.intervention.status=='pending');
}

function canPublish() {
    return this.status=='public' &&
           this.status!=this.intervention.status;
}

function canMove() {
    return !!this.intervention._id && !!this.intervention.sessionId;
}

function sessionHasChanged() {
    return this.selectedSessionId && this.selectedSessionId !== this.sessionId;
}

function currentSessionDisplay() {
    if (!this.availableSessions.length) {
        return 'Current session';
    }
    const session = this.availableSessions.find(s => s._id === this.sessionId);
    return session ? this.formatSessionOption(session) : 'Current session';
}

function onOrganizationChange(o) {
    this.organization       = o;
    this.government         = o.government;
    this.organizationId     = o.organizationTypeId;
    this.organizationTypeId = o.organizationTypeId;
    this.title              = `${o.name} ${(o.acronym||'') && `(${o.acronym})`}`;
}

function isKronosUser(id) {
    const pattern = /^[a-fA-F0-9]{24}$/;

    return pattern.test(id);
}

async function loadAvailableSessions() {
    if (this.availableSessions.length > 0) return;

    try {
        this.sessionsLoading = true;
        this.sessionsError = null;
        const meetingIds = this.meetings.map(m => mapObjectId(m._id));
        this.availableSessions = await this.api.querySessions({
            q: { meetingIds: { $in: meetingIds } },
            s: { date: -1 }
        });
    } catch (err) {
        this.sessionsError = err;
    } finally {
        this.sessionsLoading = false;
    }
}

function formatSessionOption(session) {
    const date = formatDate(timezone(session.date, session.timezone), 'd LLL yyyy (cccc) T');
    return session.title ? `${session.title} - ${date}` : date;
}

function toggleMoveEnabled() {
    this.moveEnabled = !this.moveEnabled;
    if (this.moveEnabled) {
        this.loadAvailableSessions();
    } else {
        this.selectedSessionId = this.sessionId;
    }
}

async function save(publish=false){
  try {

      this.progress = true;

    let   interventionId     = this.interventionId;

    // Move intervention if session changed (BEFORE other operations)
    if (this.sessionHasChanged && interventionId) {
        await this.api.moveInterventionToSession(this.selectedSessionId, interventionId);
    }
    const title              = this.title;
    const status             = this.status;
    const organizationId     = this.organizationId;
    const organizationTypeId = this.organizationTypeId;
    const meetingId          = this.agendaItem.meetingId;
    const agendaItem         = this.agendaItem.item;
    const datetime           = this.datetime;
    const government         = (this.government||'').toLowerCase() || undefined;
    const filesToAdd         = this.files.filter(o=> !o._id);
    const filesToUpdate      = this.files.filter(o=>!!o._id);

    const validUploads = filesToAdd.every(o=>!!o.htmlFile);
    
    if(!validUploads) throw new Error("Must select a file to upload")

    const updates = { 
        ...this.intervention, 
        meetingId, 
        agendaItem, 
        title, 
        status, 
        datetime,
        government, 
        organizationId,
        organizationTypeId,
        files: undefined, // avoid sending back
    };

    let updatedIntervention = interventionId  ? await this.api.updateIntervention(interventionId, updates)   
                                                : await this.api.createPendingIntervention(updates);

    interventionId      = updatedIntervention._id;
    this.interventionId = updatedIntervention._id;

    //TODO Optimize 
    const updatedFiles = await Promise.all(filesToUpdate.map(f=> {
        const data = mapFileData(f);
        return this.api.updateInterventionFile(interventionId, f._id, data);
      }));

    const addedFiles   = await Promise.all(filesToAdd.map(f=> { 
        const { htmlFile } = f;
        const data = { ...mapFileData(f),
            filename    : htmlFile.name,
            contentType : htmlFile.type,
        }
        return this.api.uploadInterventionFile(interventionId, data, htmlFile);
    }));

    updatedIntervention.files = addedFiles.concat(updatedFiles);

    // Adopt the uploaded ids so a later failure that keeps the modal open (a rejected translation
    // request) retries as an update instead of uploading the same file twice.
    filesToAdd.forEach((f, i) => this.$set(f, '_id', addedFiles[i]._id));

    if(publish) {
        const { sessionId } = this;

        updatedIntervention = await this.api.assignInterventionToSession(sessionId,  interventionId, { datetime })
    }

    await this.requestTranslations(interventionId, updatedIntervention);

    this.close(updatedIntervention);

  } catch(err) {
    this.error = err
  } finally {
    this.progress = null;
  }
}

// Runs last in save(): the intervention, its files and the publish are already committed, so a
// failed request must surface rather than close the modal. By now save() has written the uploaded
// ids back into `files`, so the source file has an id even on a brand-new intervention.
async function requestTranslations(interventionId, updatedIntervention) {

    const requests = this.langsToRequest;

    if(!requests.length) return;

    const results = await Promise.all(requests.map(({ lang, public: isPublic }) =>
        this.api.requestInterventionFileTranslation(interventionId, this.sourceFile._id, lang, isPublic)
            .then(status => ({ lang, status }))
            .catch(err   => ({ lang, error: (err && (err.message || err.code)) || 'Request failed' }))
    ));

    // Hand the fresh statuses to the parent list, which re-renders from what save() returns.
    updatedIntervention.translations = { ...this.translations };

    for(const { lang, status } of results.filter(r => r.status))
        updatedIntervention.translations[lang] = status;

    const failed = results.filter(r => r.error);

    if(failed.length)
        throw new Error(`Saved, but the translation request failed for `
                      + failed.map(f => `${languageName(f.lang)} (${f.error})`).join(', '));
}

function mapFileData(file) {
    let { allowPublic, public: isPublic } = file;

    allowPublic = allowPublic || false;
    isPublic    = isPublic    && allowPublic;

    const data = {
        ...file,
        allowPublic,
        public : isPublic,
        htmlFile: undefined,
        text: undefined
    }

    return data;
}

function clearError() {
  this.error    = null;
  this.progress = null;
}

</script>