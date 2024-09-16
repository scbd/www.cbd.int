
<template >
  <div class="position-relative">
    <!-- Medium view and above -->
    <div class="document-files">
        <div v-for=" {language, text, contentType, url, public: isPublic, allowPublic, _id} in files" v-bind:key="_id" >
          <span class="d-none d-md-inline">
            <a @click="showPreview(text, language)" :style="{ visibility: (text?'visible':'hidden') }" :class="{ 'btn btn-lg btn-outline-dark': showPreviewAsButton}">
              <i :style="{ visibility: (text?'visible':'hidden') }" class="fa fa-file-text-o" aria-hidden="true"></i>
            </a>
            <a target="_blank" :href="url">
              <i :class="[getMimeConfig(contentType).icon, getMimeConfig(contentType).color]" class="fa"/>
                <span class="language">
                    {{ language| langTextFilter }}
                </span>
            </a>
          </span>

          <span class="d-md-none">
            <button class="btn" :class="getMimeConfig('default').btn" :style="{ visibility: (text?'visible':'hidden') }" @click="showPreview(text, language)">
              <i class="fa fa-file-text-o" aria-hidden="true"></i>
            </button>
            <a target="_blank" :href="url" class="btn" :class="getMimeConfig(contentType).btn">
              <i :class="getMimeConfig(contentType).icon" class="fa"/>
            </a>
            <span class="language">
                {{ language }}
            </span>
          </span>

          <i v-if="!isPublic" class="fa fa-eye-slash" :class="{ 'text-success' : allowPublic, 'text-muted': !allowPublic}"/>
        </div>
    </div>
  </div>
</template>


<script>

import languages from '~/data/languages';
import { showPreview } from './text-preview-dialog.vue'; 

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
              files: { type: Object, required: false },
              showPreviewAsButton: { type: Boolean, default: false }
            },
  methods : { getMimeConfig, showPreview },
  filters : { langTextFilter },
  data
}

function data(){ return { show: false, preview:null, previewLanguage: null } } 


function langTextFilter(langCode){ 
  return languages[langCode] || 'Not Specified' 
}

function getMimeConfig(mimeType){
  return MIMES[ mimeType ] || MIMES[ 'default' ]
}

</script>

<style scoped>
.red      { color: red; }
.blue     { color: blue; }
.green    { color: green; }
.orange   { color: orange;}
.language { display: inline }
.dropdown-menu{ 
  width: 250px;
  position: absolute; 
  will-change: transform; 
  top: 0px; 
  left: 0px; 
  transform: translate3d(-216px, 48px, 0px);
}
.d-md-none > .language {
  text-transform:uppercase;
}
.document-files {
  text-align: left;
  padding-left: 25px;
}

.btn-outline-dark:hover {
  color: #fff !important;
}

</style>