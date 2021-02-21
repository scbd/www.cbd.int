
<template >
  <div class="position-relative">
    <!-- Medium view and above -->
    <div class="document-files">
        <div v-for=" {language, text, contentType, url, public: isPublic, allowPublic, _id} in files" v-bind:key="_id" >

          <span class="d-none d-md-inline">
            <i :style="{ visibility: (text?'visible':'hidden') }" class="fa fa-file-text-o" aria-hidden="true" @click="showPreview(text)"></i>
            <a target="_blank" :href="url">
              <i :class="[getMimeConfig(contentType).icon, getMimeConfig(contentType).color]" class="fa"/>
                <span class="language">
                    {{ language| langTextFilter }}
                </span>
            </a>
          </span>

          <span class="d-md-none">
            <button class="btn" :class="getMimeConfig('default').btn" :style="{ visibility: (text?'visible':'hidden') }" @click="showPreview(text)">
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


    <div style="white-space: normal; text-align: left" class="modal fade bd-example-modal-lg" ref="preview" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Preview</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="preview">{{cleanUpText(preview)}}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn" data-dismiss="modal">Close</button>
          </div>

        </div>
      </div>
    </div>    
  </div>
</template>


<script>

import languages from '../../languages.js';

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
              files: { type: Object, required: false }
            },
  methods : { getMimeConfig, showPreview, cleanUpText },
  filters : { langTextFilter },
  data
}

function data(){ return { show: false, preview:null} } 

function showPreview(text) {

  this.preview = text;

  if(this.preview)
    $(this.$refs.preview).modal('show');
}

function langTextFilter(langCode){ 
  return languages[langCode] || 'Not Specified' 
}

function getMimeConfig(mimeType){
  return MIMES[ mimeType ] || MIMES[ 'default' ]
}

function cleanUpText(text) {
  return (text||'').replace(/\n+/g, '\n').trim();
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

.preview {
  white-space: pre-wrap;
  font-size:15pt;
  line-height:25pt;
  font-family:Arial;
}

.modal-xl {
  max-width: 80%;
}
</style>