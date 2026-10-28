<template>
    <div class="cm-wrap">
        <div class="cm-main">
            <div class="cm-page-head">
                <h1>Edit conference menu <small v-if="conference">{{ conference.code }}</small></h1>
                <p>Configure the menu structure shown in the conference header.</p>
            </div>

            <div v-if="error" class="cm-alert-danger"><i class="fa fa-exclamation-triangle"></i> {{ error }}</div>
            <div v-if="conflict" class="cm-alert-danger" style="justify-content:space-between">
                <span><i class="fa fa-exclamation-triangle"></i> {{ conflict }}</span>
                <button type="button" class="cm-btn-ghost-sm" @click="reload" :disabled="loading"><i class="fa fa-refresh"></i> Load latest settings</button>
            </div>
            <div v-if="loading" class="text-muted"><i class="fa fa-cog fa-spin"></i> Loading...</div>

            <template v-if="conference">
                <section class="cm-card">
                    <div class="cm-card-head"><h2>Conference</h2></div>
                    <div class="cm-card-body">
                        <h3 style="margin:0 0 4px">{{ conference.Title && conference.Title.en }}</h3>
                        <p v-if="conference.Description && conference.Description.en" class="text-muted">{{ conference.Description.en }}</p>
                        <dl class="cm-info">
                            <dt>Code</dt><dd>{{ conference.code }}</dd>
                            <dt>Venue</dt><dd>{{ conference.Venue && conference.Venue.en }}</dd>
                            <dt>Timezone</dt><dd>{{ conference.timezone }}</dd>
                            <dt>Start</dt><dd>{{ formatDate(conference.StartDate) }}</dd>
                            <dt>End</dt><dd>{{ formatDate(conference.EndDate) }}</dd>
                        </dl>
                    </div>
                </section>

                <section class="cm-card">
                    <div class="cm-card-head"><h2>Last modified</h2></div>
                    <div class="cm-card-body">
                        <template v-if="lastModified.on">
                            <b>{{ formatDate(lastModified.on) }}</b>
                            <span v-if="lastModified.by !== undefined"> by <b>{{ lastModified.by }}</b></span>
                        </template>
                        <span v-else class="text-muted">These settings have not been edited yet.</span>
                    </div>
                </section>

                <section class="cm-card">
                    <div class="cm-card-head"><h2>Preview</h2></div>
                    <div class="cm-card-body">
                        <div class="cm-preview-frames">
                            <div v-for="frame in currentMode.frames" :key="frame.width" class="cm-preview-frame"
                                :class="`cm-preview-${currentMode.device}`" :style="frame.width && { width: `${frame.width}px` }">
                                <div v-if="frame.name" class="cm-preview-caption">{{ frame.name }} · {{ frame.width }}px</div>
                                <conference-menu-preview :conference="previewConference" :menus="cleanMenus" />
                            </div>
                        </div>
                        <div class="cm-preview-modes">
                            <button v-for="mode in PREVIEW_MODES" :key="mode.id" type="button" class="cm-btn-ghost-sm"
                                :class="{ 'cm-active': previewMode === mode.id }" @click="previewMode = mode.id">
                                <i class="fa" :class="mode.icon"></i> {{ mode.label }}
                            </button>
                        </div>
                    </div>
                </section>

                <section class="cm-card">
                    <div class="cm-card-head"><h2>General</h2></div>
                    <div class="cm-card-body">
                        <div v-for="field in GENERAL_FIELDS" :key="field.key" class="form-group">
                            <label>{{ field.label }}</label>
                            <input v-model.trim="general[field.key]" class="cm-inp">
                        </div>
                    </div>
                </section>

                <section class="cm-card">
                    <div class="cm-card-head">
                        <h2>Menus ({{ menus.length }})</h2>
                        <button type="button" class="cm-btn-ghost-sm" @click="menus.push(newConferenceMenu())"><i class="fa fa-plus"></i> Add menu</button>
                    </div>
                    <div class="cm-card-body">
                        <div v-if="!menus.length" class="cm-empty-state">No menus yet. Click "Add menu" to get started.</div>
                        <conference-menu-item-editor v-for="(menu, i) in menus" :key="i" :item="menu" :index="i" :timezone="timezone"
                            :can-move-up="i > 0" :can-move-down="i < menus.length - 1"
                            @onDelete="menus.splice(i, 1)" @onMoveUp="move(i, -1)" @onMoveDown="move(i, 1)" />
                    </div>
                </section>

                <section class="cm-card">
                    <div class="cm-card-head">
                        <h2>Custom header <span v-if="translationCount('customHeader')" class="cm-nav-count" style="margin-left:6px" title="Languages other than English that have HTML">+{{ translationCount('customHeader') }}</span></h2>
                        <div class="cm-preview-modes" style="margin:0">
                            <button v-for="lang in LANGUAGES" :key="lang" type="button" class="cm-btn-ghost-sm"
                                :class="{ 'cm-active': htmlLang === lang }" @click="htmlLang = lang">{{ lang.toUpperCase() }}</button>
                        </div>
                    </div>
                    <div class="cm-card-body">
                        <div v-if="!canEditCustom" class="cm-note"><i class="fa fa-lock"></i> Contact IT to edit this section.</div>
                        <div class="form-group">
                            <label>HTML <small class="text-muted">({{ htmlLang.toUpperCase() }})</small></label>
                            <textarea v-model="custom.customHeader.html[htmlLang]" class="cm-inp" rows="6" :disabled="!canEditCustom"></textarea>
                        </div>
                        <div class="form-group">
                            <label>CSS <small class="text-muted">(applies to all languages)</small></label>
                            <textarea v-model="custom.customHeader.style" class="cm-inp" rows="4" :disabled="!canEditCustom"></textarea>
                        </div>
                    </div>
                </section>

                <section class="cm-card">
                    <div class="cm-card-head">
                        <h2>Custom footer <span v-if="translationCount('customFooter')" class="cm-nav-count" style="margin-left:6px" title="Languages other than English that have HTML">+{{ translationCount('customFooter') }}</span></h2>
                        <div class="cm-preview-modes" style="margin:0">
                            <button v-for="lang in LANGUAGES" :key="lang" type="button" class="cm-btn-ghost-sm"
                                :class="{ 'cm-active': htmlLang === lang }" @click="htmlLang = lang">{{ lang.toUpperCase() }}</button>
                        </div>
                    </div>
                    <div class="cm-card-body">
                        <div v-if="!canEditCustom" class="cm-note"><i class="fa fa-lock"></i> Contact IT to edit this section.</div>
                        <div class="form-group">
                            <label>HTML <small class="text-muted">({{ htmlLang.toUpperCase() }})</small></label>
                            <textarea v-model="custom.customFooter.html[htmlLang]" class="cm-inp" rows="6" :disabled="!canEditCustom"></textarea>
                        </div>
                        <div class="form-group">
                            <label>CSS <small class="text-muted">(applies to all languages)</small></label>
                            <textarea v-model="custom.customFooter.style" class="cm-inp" rows="4" :disabled="!canEditCustom"></textarea>
                        </div>
                    </div>
                </section>

                <div class="cm-actions">
                    <div class="cm-status" :class="isDirty ? 'cm-unsaved' : 'cm-saved'">
                        <span class="cm-dot"></span>
                        {{ isDirty ? 'Unsaved changes' : 'All changes saved' }}
                    </div>
                    <a class="cm-btn-ghost" :href="`/conferences/${encodeURIComponent(route.params.code)}`">Close</a>
                    <button type="button" class="cm-btn-primary" @click="save" :disabled="loading || saving || !!conflict">
                        <i v-if="saving" class="fa fa-cog fa-spin"></i> Save
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import moment from 'moment-timezone'
import Api, { ConferencePortalError } from '~/components/meetings/api.js'
import remapCode from '~/components/meetings/sessions/re-map.js'
import conferenceMenuPreview from '~/components/meetings/conference-menu-preview.vue'
import conferenceMenuItemEditor, { newConferenceMenu } from '~/components/meetings/conference-menu-item-editor.vue'

const GENERAL_FIELDS  = [
    { key: 'articleId',           label: 'Article ID' },
    { key: 'streamId',            label: 'Web Stream ID' },
    { key: 'defaultCctvStreamId', label: 'Default CCTV stream ID' },
]

const LANGUAGES       = ['en', 'ar', 'es', 'fr', 'ru', 'zh']
const DATE_FORMAT     = 'D MMM YYYY, HH:mm'
const CUSTOM_SECTIONS = [{ key: 'customHeader', label: 'Header' }, { key: 'customFooter', label: 'Footer' }]

const PREVIEW_MODES = [
    { id: 'desktop',    device: 'desktop', label: 'Desktop',        icon: 'fa-desktop', frames: [{ width: 0 }] },
    { id: 'tablet',     device: 'tablet',  label: 'Tablet',         icon: 'fa-tablet',  frames: [{ width: 768, name: 'iPad' }] },
    { id: 'mobile-all', device: 'mobile',  label: 'Mobile (all)',   icon: 'fa-mobile',  frames: [
        { width: 320, name: 'iPhone SE (1st gen), iPhone 5s' },
        { width: 375, name: 'iPhone SE, iPhone 8, iPhone 13 mini' },
        { width: 414, name: 'iPhone 11, iPhone XR, iPhone 8 Plus' },
    ] },
]

export default {
    name       : 'ConferenceEditMenu',
    components : { conferenceMenuItemEditor, conferenceMenuPreview },
    props      : {
        route       : { type: Object,   required: false },
        tokenReader : { type: Function, required: false }
    },
    data() {
        return { loading: true, saving: false, error: null, conference: null, menus: [], settings: null, version: null, conflict: null, cleanSnapshot: '', previewMode: 'desktop', PREVIEW_MODES, LANGUAGES, CUSTOM_SECTIONS, htmlLang: 'en', custom: emptyCustom(), GENERAL_FIELDS, general: emptyGeneral() }
    },
    mounted() { // the page shell wraps the view in a fixed-width .container: lift its width limit while editing (keeps its gutters)
        this.container = this.$el.closest('.container')
        if(this.container) this.container.classList.add('cm-fullwidth')
    },
    beforeDestroy() {
        if(this.container) this.container.classList.remove('cm-fullwidth')
    },
    async created() {
        this.api = new Api(this.tokenReader)

        try {
            // the record only gives the code/timezone the preview needs; the settings and their version come from the portal api
            this.conference = await this.api.getConference(remapCode(this.route.params.code))
            if(!this.conference) throw new Error('Conference not found')

            await this.loadSettings()
        }
        catch(e) { this.error = e.message || `${e}` }
        finally  { this.loading = false }
    },
    computed: {
        timezone() { return validTimezone(this.conference && this.conference.timezone) },
        currentMode() { return PREVIEW_MODES.find(m => m.id === this.previewMode) },
        cleanMenus() { return this.menus.map(clean) }, // same shape that gets saved
        // Custom header/footer hold raw html/css: only Administrator may change them. conferencePortalAdministrator (see
        // CONFERENCE_MENU_ROLES) can open the page and edit everything else, but sees these two sections read-only.
        // Page-only rule: Gaia must enforce it too.
        canEditCustom() { return this.$auth.hasScope(['Administrator']) },
        lastModified() { // Gaia stamps `meta` on every save (the editor never sends it); `meta._updatedBy` is the resolved user
            const meta = (this.settings && this.settings.meta) || {}
            const user = meta._updatedBy || {}
            const date = meta.updatedOn ? new Date(meta.updatedOn) : null // an unparsable value is treated as never edited, toISOString would throw
            const name = [user.firstName, user.lastName].filter(Boolean).join(' ')

            return { on: date && !isNaN(date) ? date : null, by: name || meta.updatedBy }
        },
        cleanCustom() { return cleanCustom(this.custom) },
        cleanGeneral() { return cleanGeneral(this.general) },
        previewConference() { // the conference as it would be saved: custom header/footer replaced by the draft ones
            const { customHeader, customFooter, ...rest } = this.settings || {}
            return { ...this.conference, conference: { ...rest, ...this.cleanCustom } }
        },
        isDirty()    { return this.snapshot() !== this.cleanSnapshot }
    },
    methods: {
        newConferenceMenu,
        // Loads the settings together with the version they came with: that version is the one the next save must send
        async loadSettings() {
            const { settings, version } = await this.api.getConferencePortalSettings(this.conference.code)

            this.applySettings(settings, version)
        },
        applySettings(settings, version) {
            this.settings = settings
            this.version  = version
            this.menus    = (settings.menus || []).map(fill)
            this.custom   = fillCustom(settings)
            this.general  = fillGeneral(settings)
            this.cleanSnapshot = this.snapshot()
        },
        async reload() { // discards the current edits in favour of the latest saved settings
            this.loading = true
            this.error   = null

            try     { await this.loadSettings(); this.conflict = null }
            catch(e){ this.error = e.message || `${e}` }
            finally { this.loading = false }
        },
        formatDate(date) { // shown in the conference's own timezone
            return date ? `${moment.tz(date, this.timezone).format(DATE_FORMAT)} (${this.timezone})` : ''
        },
        translationCount(key) { return LANGUAGES.filter(lang => lang !== 'en' && this.custom[key].html[lang]).length },
        snapshot() { return JSON.stringify([this.cleanMenus, this.cleanCustom, this.cleanGeneral]) },
        move(i, dir) {
            if(!this.menus[i + dir]) return
            this.menus.splice(i + dir, 0, this.menus.splice(i, 1)[0])
        },
        async save() {
            this.saving = true
            this.error  = null

            try {
                // header/footer are administrator-only: for anyone else keep the stored values untouched
                const { customHeader, customFooter, articleId, streamId, defaultCctvStreamId, ...rest } = this.settings
                const stored   = { ...(customHeader && { customHeader }), ...(customFooter && { customFooter }) }
                const settings = { ...rest, menus: this.cleanMenus, ...this.cleanGeneral, ...(this.canEditCustom ? this.cleanCustom : stored) }

                // always the version of the settings these edits are based on, never a freshly fetched one
                const saved = await this.api.updateConferencePortalSettings(this.conference.code, settings, this.version)

                this.applySettings(saved.settings, saved.version)
            }
            catch(e) {
                if(e instanceof ConferencePortalError && e.code === 'conflict') this.conflict = e.message // no retry: the user decides when to load the latest
                else this.error = e.message || `${JSON.stringify(e)}`
            }
            finally  { this.saving = false }
        }
    }
}

function validTimezone(timeZone) { // an unknown name makes moment fall back to UTC offsets silently: be explicit
    return moment.tz.zone(timeZone) ? timeZone : 'UTC'
}

function emptyGeneral() {
    return Object.fromEntries(GENERAL_FIELDS.map(({ key }) => [key, '']))
}

function fillGeneral(settings) {
    return Object.fromEntries(GENERAL_FIELDS.map(({ key }) => [key, settings[key] == null ? '' : `${settings[key]}`]))
}

// Empty fields are left out, so they are removed from the stored settings
function cleanGeneral(general) {
    return Object.fromEntries(Object.entries(general).filter(([, value]) => value))
}

function emptyCustom() {
    return { customHeader: { html: {}, style: '' }, customFooter: { html: {}, style: '' } }
}

function fillCustom(conference) {
    const custom = emptyCustom()
    for(const { key } of CUSTOM_SECTIONS) {
        const value = conference[key]
        if(typeof value === 'string') custom[key].html = toText(value) // legacy plain string
        else if(value) custom[key] = { html: toText(value.html), style: value.style || '' }
    }
    return custom
}

// Only keep a header/footer when it has content, so conferences without one stay untouched
function cleanCustom(custom) {
    const out = {}
    for(const { key } of CUSTOM_SECTIONS) {
        const html  = cleanText(custom[key].html)
        const style = custom[key].style
        if(!Object.keys(html).length && !style) continue
        out[key] = { ...(Object.keys(html).length && { html }), ...(style && { style }) }
    }
    return out
}

// Existing menus may omit fields: add them so the editor can bind to them
function fill(menu) {
    return { ...newConferenceMenu(), ...menu,
        title      : toText(menu.title),
        shortTitle : toText(menu.shortTitle),
        links      : (menu.links || []).map(l => ({ target: '', ...l, title: toText(l.title) })),
        menus      : (menu.menus || []).map(fill) }
}

// Titles are localized objects, but legacy data may hold a plain string (lstring accepts both)
function toText(text) {
    return typeof text === 'string' ? { en: text } : { ...text }
}

// Drop empty values so saved menus stay as lean as the hand-written ones
function clean(menu) {
    const out = {}
    for(const [key, value] of Object.entries(menu)) {
        if(key === 'menus') { if(value.length) out.menus = value.map(clean); continue }
        if(key === 'links') { if(value.length) out.links = value.map(l => ({ ...l, title: cleanText(l.title) })); continue }
        if(key === 'title' || key === 'shortTitle') { const t = cleanText(value); if(Object.keys(t).length) out[key] = t; continue } // an empty title object would hide the icon-only rendering
        if(value !== '' && value != null) out[key] = value
    }
    return out
}

function cleanText(text) {
    return Object.fromEntries(Object.entries(text || {}).filter(([, v]) => v))
}
</script>

<style>
/* Lean subset of the absch.cbd.int portal editor theme (edit-portal.css + tokens.css), scoped to .cm-wrap */
.cm-wrap {
  --scbd-navy: #0b3b4d;
  --scbd-navy-50: #eef4f7;
  --scbd-accent: #e4572e;
  --scbd-accent-600: #c8451f;
  --scbd-ink-2: #3c4e57;
  --scbd-ink-3: #6a7d87;
  --scbd-line: #dde4e8;
  --scbd-line-2: #eef2f4;
  --scbd-ok: #2e8b57;
  --scbd-danger: #d64541;
  --scbd-danger-50: #fdf1f0;
  --scbd-danger-200: #f1c4c2;
  --scbd-focus: #2a6fdb;
  --scbd-radius: 7px;

  background: #eef1f4;
  padding: 24px;
}

.cm-main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }

.cm-page-head h1 { margin: 0; font-size: 26px; font-weight: 700; color: var(--scbd-navy); }
.cm-page-head p  { margin: 3px 0 0; color: var(--scbd-ink-3); }

/* Cards */
.cm-card { background: #fff; border: 1px solid var(--scbd-line); border-radius: 10px; }
.cm-card-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--scbd-line-2); }
.cm-card-head h2 { margin: 0; font-size: 17px; font-weight: 700; color: var(--scbd-navy); }
.cm-card-body { padding: 18px 20px; }

/* Inputs */
.cm-inp { width: 100%; border: 1px solid var(--scbd-line); border-radius: 6px; padding: 10px 14px; background: #fff; transition: border-color .15s, box-shadow .15s; }
.cm-inp:focus, .cm-lang-inp:focus-within { outline: 0; border-color: var(--scbd-focus); box-shadow: 0 0 0 3px rgba(42, 111, 219, .12); }

.cm-lang-inp { display: flex; border: 1px solid var(--scbd-line); border-radius: 6px; overflow: hidden; background: #fff; }
.cm-lang-prefix { display: flex; align-items: center; padding: 0 12px; background: var(--scbd-navy-50); color: var(--scbd-navy); font-weight: 700; border-right: 1px solid var(--scbd-line); user-select: none; }
.cm-lang-inp input { flex: 1; border: 0; outline: 0; padding: 10px 14px; min-width: 0; }

/* Buttons */
.cm-btn-primary, .cm-btn-ghost, .cm-btn-ghost-sm { display: inline-flex; align-items: center; gap: 7px; border-radius: var(--scbd-radius); cursor: pointer; text-decoration: none; transition: background .15s, border-color .15s; }
.cm-btn-primary { background: var(--scbd-accent); color: #fff; border: 1px solid transparent; font-weight: 600; padding: 9px 18px; }
.cm-btn-primary:hover:not(:disabled) { background: var(--scbd-accent-600); }
.cm-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.cm-btn-ghost, .cm-btn-ghost-sm { background: #fff; color: var(--scbd-ink-2); border: 1px solid var(--scbd-line); }
.cm-btn-ghost { font-weight: 600; padding: 9px 16px; }
.cm-btn-ghost-sm { padding: 6px 11px; }
.cm-btn-ghost:hover, .cm-btn-ghost-sm:hover { border-color: var(--scbd-navy); color: var(--scbd-navy); }

/* Alert + save bar */
.cm-alert-danger { display: flex; align-items: center; gap: 10px; background: var(--scbd-danger-50); border: 1px solid var(--scbd-danger-200); color: var(--scbd-danger); border-radius: var(--scbd-radius); padding: 12px 16px; }
.cm-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.cm-status { display: flex; align-items: center; gap: 9px; color: var(--scbd-ink-3); }
.cm-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--scbd-ink-3); }
.cm-unsaved .cm-dot { background: var(--scbd-accent); }
.cm-saved .cm-dot { background: var(--scbd-ok); }

.cm-info { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; margin: 0; }
.cm-info dt { color: var(--scbd-ink-3); font-weight: 600; }
.cm-info dd { margin: 0; }

/* Count badge, e.g. the number of translated languages */
.cm-nav-count { font-size: 11px; background: var(--scbd-navy-50); color: var(--scbd-navy); border-radius: 10px; padding: 1px 8px; font-weight: 600; }

/* Menu items */
.cm-item { border: 1px solid var(--scbd-line); border-radius: 8px; margin-bottom: 8px; background: #fff; }
.cm-item-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--scbd-navy-50); color: var(--scbd-navy); cursor: pointer; border-radius: 8px; }
.cm-item-body { padding: 14px 16px; }
.cm-item-box { padding: 10px 12px; background: var(--scbd-navy-50); border-radius: 8px; }
.cm-item .form-group { margin-bottom: 12px; }
.cm-empty-state { text-align: center; padding: 28px; color: var(--scbd-ink-3); border: 1.5px dashed var(--scbd-line); border-radius: 9px; }

/* Preview device modes. The header's responsive rules key off the real viewport width (bootstrap visible-* helpers
   and a few max-width:767px rules in conference-header.html), so they are re-applied here per frame width. */
.cm-preview-frames { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 16px; }
.cm-preview-frame { max-width: 100%; }
.cm-preview-desktop { width: 100%; }
.cm-preview-frame:only-child { margin: 0 auto; }
.cm-preview-caption { text-align: center; color: var(--scbd-ink-2); font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.cm-preview-tablet, .cm-preview-mobile { border: 1px dashed var(--scbd-line); }
.cm-preview-modes { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
.cm-preview-modes .cm-active { background: var(--scbd-navy-50); border-color: var(--scbd-navy); color: var(--scbd-navy); }

.cm-preview-mobile .visible-xs { display: block !important; }
.cm-preview-mobile table.visible-xs { display: table !important; }
.cm-preview-mobile .visible-sm, .cm-preview-mobile .visible-md, .cm-preview-mobile .visible-lg, .cm-preview-mobile .hidden-xs { display: none !important; }
.cm-preview-mobile TABLE.meetingnav-table { height: 72px; border-left: none; border-right: none; }
.cm-preview-mobile .meetingnav-button { border-left: 1px solid #fff; max-width: 20%; }
.cm-preview-mobile .meetingnav-button:first-child { border-left: none; }
.cm-preview-mobile .meetingnav-buttongroup { border-left: 1px solid #fff; }

.cm-preview-tablet .visible-sm { display: block !important; }
.cm-preview-tablet .visible-xs, .cm-preview-tablet .visible-md, .cm-preview-tablet .visible-lg, .cm-preview-tablet .hidden-sm { display: none !important; }

.cm-note { margin-bottom: 12px; padding: 10px 14px; background: var(--scbd-navy-50); border-radius: var(--scbd-radius); color: var(--scbd-navy); }

/* full-width page: the shell's .container keeps its padding, only the width limit goes */
.container.cm-fullwidth { width: auto; max-width: none; }
</style>
