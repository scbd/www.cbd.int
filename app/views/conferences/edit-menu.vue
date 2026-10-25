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
                        <conference-menu-item-editor v-for="(menu, i) in menus" :key="i" :item="menu" :index="i"
                            :can-move-up="i > 0" :can-move-down="i < menus.length - 1"
                            @onDelete="menus.splice(i, 1)" @onMoveUp="move(i, -1)" @onMoveDown="move(i, 1)" />
                    </div>
                </section>

                <section class="cm-card">
                    <div class="cm-card-head">
                        <h2>Custom header</h2>
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
                        <h2>Custom footer</h2>
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
import Api, { ConferencePortalError } from '~/components/meetings/api.js'
import remapCode from '~/components/meetings/sessions/re-map.js'
import conferenceMenuPreview from '~/components/meetings/conference-menu-preview.vue'
import conferenceMenuItemEditor, { newConferenceMenu } from '~/components/meetings/conference-menu-item-editor.vue'

const GENERAL_FIELDS  = [
    { key: 'articleId',           label: 'Article ID' },
    { key: 'streamId',            label: 'Stream ID' },
    { key: 'defaultCctvStreamId', label: 'Default CCTV stream ID' },
]

const LANGUAGES       = ['en', 'ar', 'es', 'fr', 'ru', 'zh']
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
        return { loading: true, saving: false, error: null, conference: null, menus: [], settings: null, etag: null, conflict: null, cleanSnapshot: '', previewMode: 'desktop', PREVIEW_MODES, LANGUAGES, CUSTOM_SECTIONS, htmlLang: 'en', custom: emptyCustom(), GENERAL_FIELDS, general: emptyGeneral() }
    },
    mounted() { // the page shell wraps the view in a fixed-width .container: go full width while editing
        this.container = this.$el.closest('.container')
        if(this.container) this.container.classList.replace('container', 'container-fluid')
    },
    beforeDestroy() {
        if(this.container) this.container.classList.replace('container-fluid', 'container')
    },
    async created() {
        this.api = new Api(this.tokenReader)

        try {
            // the record only gives the code/timezone the preview needs; the settings and their ETag come from the portal api
            this.conference = await this.api.getConference(remapCode(this.route.params.code))
            if(!this.conference) throw new Error('Conference not found')

            await this.loadSettings()
        }
        catch(e) { this.error = e.message || `${e}` }
        finally  { this.loading = false }
    },
    computed: {
        currentMode() { return PREVIEW_MODES.find(m => m.id === this.previewMode) },
        cleanMenus() { return this.menus.map(clean) }, // same shape that gets saved
        canEditCustom() { return this.$auth.hasScope(['Administrator']) },
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
        // Loads the settings together with the ETag they came with: that ETag is the one the next save must send
        async loadSettings() {
            const { settings, etag } = await this.api.getConferencePortalSettings(this.conference.code)

            this.applySettings(settings, etag)
        },
        applySettings(settings, etag) {
            this.settings = settings
            this.etag     = etag
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

                // always the ETag of the settings these edits are based on, never a freshly fetched one
                const saved = await this.api.updateConferencePortalSettings(this.conference.code, settings, this.etag)

                this.applySettings(saved.settings, saved.etag)
            }
            catch(e) {
                if(e instanceof ConferencePortalError && e.code === 'conflict') this.conflict = e.message // no retry: the user decides when to load the latest
                else this.error = e.message || `${JSON.stringify(e)}`
            }
            finally  { this.saving = false }
        }
    }
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

<style src="./edit-menu.css"></style>
