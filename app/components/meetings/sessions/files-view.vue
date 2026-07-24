
<template >
  <div class="position-relative">
    <div class="document-files" :title="showAiIcon ? $t('aiGeneratedTranslation') : null">
        <div v-for="group in groups" :key="group[0]._id">
          <a v-if="allowPreviewText" @click="showPreview(group[0].text, group[0].language)" :style="{ visibility: (group[0].text?'visible':'hidden') }" :class="{ 'btn btn-lg btn-outline-dark': showPreviewAsButton}">
            <i class="fa fa-file-text-o" aria-hidden="true"></i>
          </a>
          <span class="file-icon">
            <i v-if="showAiIcon" class="fa fa-language"/>
            <i :class="[getMimeConfig(group[0].contentType).icon, getMimeConfig(group[0].contentType).color]" class="fa"/>
          </span>
          <span v-for="file in group" :key="file._id">
            <a :href="showAiIcon ? '#' : file.url" :target="showAiIcon ? null : '_blank'"
               @click="onFileClick(file, $event)">
              <span class="language">
                <span class="d-none d-lg-inline">{{ file.language| langTextFilter }}</span>
                <span class="d-lg-none">{{ file.language }}</span>
              </span>
            </a>
            <i v-if="!file.public" class="fa fa-eye-slash" :class="{ 'text-success' : file.allowPublic, 'text-muted': !file.allowPublic}"/>
          </span>
        </div>
    </div>
  </div>
</template>


<script>

import languages from '~/data/languages';
import i18n               from '../locales.js';
import { showPreview }    from './text-preview-dialog.vue';
import { showDisclaimer } from './disclaimer-dialog.vue';

const   MIMES = {
  'application/pdf':                                                            { priority: 10,  btn: 'btn-danger' , icon: 'fa-file-pdf-o'        , color: 'red'    },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { priority: 20,  btn: 'btn-primary', icon: 'fa-file-word-o'       , color: 'blue'   },
  'application/msword':                                                         { priority: 30,  btn: 'btn-primary', icon: 'fa-file-word-o'       , color: 'blue'   },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { priority: 40,  btn: 'btn-success', icon: 'fa-file-excel-o'      , color: 'green'  },
  'application/vnd.ms-excel':                                                   { priority: 50,  btn: 'btn-success', icon: 'fa-file-excel-o'      , color: 'green'  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { priority: 60,  btn: 'btn-warning', icon: 'fa-file-powerpoint-o' , color: 'orange' },
  'application/vnd.ms-powerpoint':                                              { priority: 70,  btn: 'btn-warning', icon: 'fa-file-powerpoint-o' , color: 'orange' },
  'application/zip':                                                            { priority: 80,  btn: 'btn-default', icon: 'fa-file-archive-o'    , color: ''       },
  'text/html':                                                                  { priority: 80,  btn: 'btn-default', icon: 'fa-link'              , color: ''       },
  'default':                                                                    { priority:999,  btn: 'btn-default', icon: 'fa-file-o'            , color: 'orange' }
}

export default {
  name    :  'FilesView',
  props   : {
              files: { type: Array, required: false, default: () => [] },
              showPreviewAsButton: { type: Boolean, default: false },
              allowPreviewText: { type: Boolean, default: true },
              showAiIcon: { type: Boolean, default: false }
            },
  computed: { groups },
  methods : { getMimeConfig, showPreview, showDisclaimer, onFileClick },
  filters : { langTextFilter },
  data,
  i18n,
}

function data(){ return { show: false, preview:null, previewLanguage: null } }

// Group files sharing the same format so the icon renders once, followed by every
// matching language for that format on the same line (instead of one icon per language).
function groups() {
  const byType = new Map();

  for(const file of this.files) {
    const key = file.contentType || 'default';
    if(!byType.has(key)) byType.set(key, []);
    byType.get(key).push(file);
  }

  for(const group of byType.values())
    group.sort((a, b) => a.language.localeCompare(b.language));

  return [...byType.values()];
}

function langTextFilter(langCode){
  return languages[langCode] || 'Not Specified'
}

function getMimeConfig(mimeType){
  return MIMES[ mimeType ] || MIMES[ 'default' ]
}

function onFileClick(file, event) {
  if(this.showAiIcon) {
    event.preventDefault();
    this.showDisclaimer(file);
  }
}

</script>

<style scoped>
.red      { color: red; }
.blue     { color: blue; }
.green    { color: green; }
.orange   { color: orange;}
.language { display: inline; margin-right: 0.4em; }
.dropdown-menu{
  width: 250px;
  position: absolute;
  will-change: transform;
  top: 0px;
  left: 0px;
  transform: translate3d(-216px, 48px, 0px);
}
.language .d-lg-none {
  text-transform:lowercase;
}
.document-files {
  text-align: left;
}

.btn-outline-dark:hover {
  color: #fff !important;
}

.file-icon .fa-language {
  margin-right: 0.15em;
}

</style>
