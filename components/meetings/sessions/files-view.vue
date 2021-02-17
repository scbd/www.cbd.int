
<template >
  <div class="position-relative">
    <!-- mobile view to medium -->
    <button v-if="files.length" @click="toggleDropdown($event)" type="button" class="d-md-none btn btn-default btn-lg">
      <i class="fa fa-arrow-circle-down" style="font-size:1.25em"/>
    </button>

    <ul ref="dropDown" :class="{ show: this.show }" class="dropdown-menu dropdown-menu-right"  >

      <li  class="dropdown-header">Select a file to download</li>

      <li v-for="{language, contentType, url, _id} in files" v-bind:key="_id"  class="dropdown-item ng-scope"  style="font-size:16px;margin:4px 0px;white-space:nowrap;">
          <a :href="url" role="menuitem" tabindex="-1"  class="language ng-binding">
            {{ language| langTextFilter }}
            <i :class="getIconClass(contentType)" class="fa ml-5"/>
          </a>
      </li>
    </ul>

    <!-- Medium view and above -->
    <div class="d-md-block document-files">
        <div v-for=" {language, text, contentType, url, public: isPublic, allowPublic, _id} in files" v-bind:key="_id" class="d-none d-md-block" >
            <i :style="{ visibility: (text?'visible':'hidden') }" class="fa fa-file-text-o" aria-hidden="true" @click="showPreview(text)"></i>
            <a target="_blank" :href="url" >
              <i :class="getIconClass(contentType)" class="fa"/>
                <span class="d-none d-md-inline language">
                    {{ language| langTextFilter }}
                </span>
            </a>
            <i v-if="!isPublic" class="fa fa-eye-slash" :class="{ 'text-muted' : !allowPublic }"/>
        </div>
    </div>


    <div style="white-space: normal; text-align: left" class="modal fade bd-example-modal-lg" ref="preview" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">Preview</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>{{preview}}</p>
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
const langMap = new Map([ ['ar','العربية'], ['en','English'], ['es','Español'], ['fr','Français'], ['ru','Русский'], ['zh','中文'] ])
const   MIMES = {
  'application/pdf':                                                            { priority: 10,  btn: 'btn-danger',  iconClasses: [ 'fa-file-pdf-o',        'red'   ] },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { priority: 20,  btn: 'btn-primary', iconClasses: [ 'fa-file-word-o',       'blue'  ] },
  'application/msword':                                                         { priority: 30,  btn: 'btn-primary', iconClasses: [ 'fa-file-word-o',       'blue'  ] },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { priority: 40,  btn: 'btn-success', iconClasses: [ 'fa-file-excel-o',      'green' ] },
  'application/vnd.ms-excel':                                                   { priority: 50,  btn: 'btn-success', iconClasses: [ 'fa-file-excel-o',      'green' ] },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { priority: 60,  btn: 'btn-warning', iconClasses: [ 'fa-file-powerpoint-o', 'orange'] },
  'application/vnd.ms-powerpoint':                                              { priority: 70,  btn: 'btn-warning', iconClasses: [ 'fa-file-powerpoint-o', 'orange'] },
  'application/zip':                                                            { priority: 80,  btn: 'btn-default', iconClasses: [ 'fa-file-archive-o'             ] },
  'text/html':                                                                  { priority: 80,  btn: 'btn-default', iconClasses: [ 'fa-link'                       ] },
  'default':                                                                    { priority:999,  btn: 'btn-default', iconClasses: [ 'fa-file-o',            'orange'] }
}

export default {
  name    :  'FilesView',
  props   : {
              files: { type: Object, required: false }
            },
  methods : { getIconClass, toggleDropdown, outSideClick, showPreview },
  filters : { langTextFilter },
  data
}

function data(){ return { show: false, preview:null} } 

function showPreview(text) {

  this.preview = text;

  if(this.preview)
    $(this.$refs.preview).modal('show');
}

function toggleDropdown(e){

  this.show = !this.show;
  e.stopPropagation()

  if(this.show){
    document.addEventListener('click', this.outSideClick)
    document.addEventListener('touchstart', this.outSideClick)
  } else {
    document.removeEventListener('click', this.outSideClick)
    document.removeEventListener('touchstart', this.outSideClick)
  }
}

function langTextFilter(langCode){ 
  return langMap.get(langCode) || 'Not Specified' 
}

function getIconClass(mimeType){
  const { iconClasses } = MIMES[ mimeType ] || MIMES[ 'default' ]

  return iconClasses
}

function outSideClick(e){
  if(this.$refs.dropDown.contains(e.target)) return e.stopPropagation()
  this.show = false
  e.stopPropagation()
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

.document-files {
  text-align: left;
  padding-left: 25px;
} 
</style>