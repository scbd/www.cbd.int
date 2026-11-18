<template>
    <div class="cm-item">
        <div class="cm-item-head" @click="expanded = !expanded">
            <i class="fa fa-fw" :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
            <span class="text-muted">{{ index }}</span>
            <b v-if="item.title && item.title.en" style="flex:1" v-html="titleHtml"></b>
            <span v-else-if="item.description" style="flex:1">
                <i style="color:#6a7d87">{{ item.description }}</i>
                <small class="text-muted" style="border:1px solid #dde4e8;border-radius:10px;padding:0 7px;margin-left:6px;background:#fff">no title · description</small>
            </span>
            <b v-else style="flex:1">{{ item.code || '(unnamed)' }}</b>
            <span style="display:flex;gap:4px" @click.stop>
                <button type="button" class="cm-btn-ghost-sm" :disabled="!canMoveUp"   @click="$emit('onMoveUp')"><i class="fa fa-arrow-up"></i></button>
                <button type="button" class="cm-btn-ghost-sm" :disabled="!canMoveDown" @click="$emit('onMoveDown')"><i class="fa fa-arrow-down"></i></button>
            </span>
            <button type="button" class="cm-btn-ghost-sm" title="Delete" @click.stop="$emit('onDelete')"><i class="fa fa-trash"></i></button>
        </div>

        <div v-if="expanded" class="cm-item-body">
            <div class="row">
                <div class="col-sm-4 form-group">
                    <label>Code</label>
                    <input v-model="item.code" class="cm-inp" placeholder="used to look up articles / build the url">
                </div>
                <div class="col-sm-4 form-group">
                    <label>Icon <small class="text-muted">(fa class, xs screens)</small></label>
                    <input v-model="item.icon" class="cm-inp" placeholder="fa-home">
                </div>
                <div class="col-sm-4 form-group">
                    <label>Style</label>
                    <input v-model="item.style" class="cm-inp" placeholder="e.g. webcast">
                </div>
            </div>

            <div v-for="field in LOCALIZED" :key="field.key" class="form-group">
                <label>{{ field.label }}</label>
                <div v-for="lang in langs(field.key)" :key="lang" class="cm-lang-inp" style="margin-bottom:4px">
                    <span class="cm-lang-prefix">{{ lang.toUpperCase() }}</span>
                    <input v-model="item[field.key][lang]" :placeholder="lang === 'en' ? field.hint : ''">
                </div>
                <a href="#" @click.prevent="toggleLangs(field.key)">
                    <small>{{ showAll[field.key] ? 'Hide translations' : 'Show translations' }}</small>
                    <span v-if="translationCount(field.key)" class="cm-nav-count" style="margin-left:6px" title="Languages other than English that have a value">+{{ translationCount(field.key) }}</span>
                </a>
            </div>

            <div class="row">
                <div class="col-sm-8 form-group">
                    <label>Url <small class="text-muted">(blank = generated from the meeting codes)</small></label>
                    <input v-model="item.url" class="cm-inp">
                </div>
                <div class="col-sm-4 form-group">
                    <label>Target</label>
                    <input v-model="item.target" class="cm-inp" placeholder="_blank or window name">
                </div>
            </div>

            <div class="row">
                <div class="col-sm-4 form-group">
                    <label>Behavior <small class="text-muted">(with sub-menus)</small></label>
                    <select v-model="item.behavior" class="cm-inp">
                        <option value="">(default)</option>
                        <option value="fixed">fixed</option>
                        <option value="collapsed">collapsed</option>
                        <option value="expanded">expanded</option>
                    </select>
                </div>
                <div class="col-sm-4 form-group">
                    <label>Visible from ({{ timezone }})</label>
                    <input v-model="startDate" type="datetime-local" class="cm-inp">
                </div>
                <div class="col-sm-4 form-group">
                    <label>Visible until ({{ timezone }})</label>
                    <input v-model="endDate" type="datetime-local" class="cm-inp">
                </div>
            </div>

            <div class="form-group">
                <label>Description <small class="text-muted">(reference only)</small></label>
                <input v-model="item.description" class="cm-inp">
            </div>

            <div class="cm-item-box">
                <div style="display:flex;align-items:center;margin-bottom:6px">
                    <b style="flex:1">Links <small class="text-muted">(2+ links render as a drop-down)</small></b>
                    <button type="button" class="cm-btn-ghost-sm" @click="item.links.push({ url:'', title:{}, target:'' })"><i class="fa fa-plus"></i> Add link</button>
                </div>
                <div v-for="(link, i) in item.links" :key="i" class="row" style="margin-bottom:4px">
                    <div class="col-sm-4"><input v-model="link.title.en" class="cm-inp" placeholder="Title (en)"></div>
                    <div class="col-sm-5"><input v-model="link.url" class="cm-inp" placeholder="Url"></div>
                    <div class="col-sm-2"><input v-model="link.target" class="cm-inp" placeholder="Target"></div>
                    <div class="col-sm-1"><button type="button" class="cm-btn-ghost-sm" title="Delete" @click="item.links.splice(i, 1)"><i class="fa fa-trash"></i></button></div>
                </div>
            </div>

            <div style="border-top:1px solid #eef2f4;margin-top:12px;padding-top:12px">
                <div style="display:flex;align-items:center;margin-bottom:6px">
                    <b style="flex:1">Sub-menus</b>
                    <button type="button" class="cm-btn-ghost-sm" @click="item.menus.push(newConferenceMenu())"><i class="fa fa-plus"></i> Add sub-menu</button>
                </div>
                <div style="padding-left:15px">
                    <conference-menu-item-editor v-for="(sub, i) in item.menus" :key="i" :item="sub" :index="i" :timezone="timezone"
                        :can-move-up="i > 0" :can-move-down="i < item.menus.length - 1"
                        @onDelete="item.menus.splice(i, 1)" @onMoveUp="move(i, -1)" @onMoveDown="move(i, 1)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment-timezone'
import { sanitizeHtml } from '~/services/html'

export const LANGUAGES = ['en', 'ar', 'es', 'fr', 'ru', 'zh']
const LOCALIZED = [
    { key: 'title',      label: 'Title',                       hint: 'Leave empty for an icon-only menu' },
    { key: 'shortTitle', label: 'Short title (small screens)', hint: 'Leave empty to use the title' }
]

export function newConferenceMenu() {
    return { code: '', icon: '', title: {}, shortTitle: {}, url: '', behavior: '', links: [], startDate: '', endDate: '', menus: [], style: '', target: '', description: '' }
}

// ISO <-> datetime-local, as wall-clock time in the conference timezone
const DATETIME_LOCAL_FORMAT = 'YYYY-MM-DDTHH:mm'
const toLocal = (d, tz)  => d ? moment.tz(d, tz).format(DATETIME_LOCAL_FORMAT) : ''
const toIso   = (v, tz)  => v ? moment.tz(v, tz).toISOString() : ''

export default {
    name  : 'ConferenceMenuItemEditor',
    props : {
        item        : { type: Object,  required: true },
        index       : { type: Number,  required: true },
        timezone    : { type: String,  default: 'UTC' },
        canMoveUp   : { type: Boolean, default: false },
        canMoveDown : { type: Boolean, default: false },
    },
    data() { return { expanded: false, showAll: {}, LOCALIZED } },
    computed: {
        titleHtml() { return sanitizeHtml(this.item.title.en) }, // titles may hold html: render it like the header does, sanitized
        startDate: { get() { return toLocal(this.item.startDate, this.timezone) }, set(v) { this.item.startDate = toIso(v, this.timezone) } },
        endDate  : { get() { return toLocal(this.item.endDate, this.timezone) }, set(v) { this.item.endDate   = toIso(v, this.timezone) } },
    },
    methods: {
        newConferenceMenu,
        translationCount(key) { return LANGUAGES.filter(lang => lang !== 'en' && this.item[key] && this.item[key][lang]).length },
        langs(key)       { return this.showAll[key] ? LANGUAGES : ['en'] },
        toggleLangs(key) { this.$set(this.showAll, key, !this.showAll[key]) },
        move(i, dir)     {
            const { menus } = this.item
            if(!menus[i + dir]) return
            menus.splice(i + dir, 0, menus.splice(i, 1)[0])
        },
    },
}
</script>
