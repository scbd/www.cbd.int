
<template >
  <div class="position-relative">
    <button v-on:click="toggleDropdown($event)" type="button" class="d-md-none btn btn-default btn-lg">
      <i class="fa fa-arrow-circle-down" style="font-size:1.25em"/>
    </button>
    <ul ref="dropDown" :class="{ show: this.show }" class="dropdown-menu dropdown-menu-right"  >

      <li  class="dropdown-header">Select a file to download</li>

      <li class="dropdown-item ng-scope" ng-repeat="(language,types) in byLanguages track by language" style="font-size:16px;margin:4px 0px;white-space:nowrap;">

          <a role="menuitem" tabindex="-1" style="display:inline-block;width:120px;font-size:inherit;" class="language ng-binding">
              العربية
          </a>

          <span>
              <a ng-repeat="(type, file) in ::types track by type" class="btn btn-sm btn-danger" style="margin-right:5px;font-size:16px;" target="_blank" href="https://www.cbd.int/doc/c/a270/2272/08837a5d085d01ff4c2adb17/excop-02-l-01-ar.pdf">
                  <i class="fa fa-file-pdf-o"></i>
              </a>
              <a ng-repeat="(type, file) in ::types track by type" class="btn btn-sm btn-primary" style="margin-right:5px;font-size:16px;" target="_blank" href="https://www.cbd.int/doc/c/a7e4/f7d9/03b82c86d8713a2e6f6a8150/excop-02-l-01-ar.docx">
                  <i class="fa fa-file-word-o"></i>
              </a>
          </span>
      </li>
    </ul>
    <div class="d-md-block document-files">
        <div v-for="( languages, mimeType ) in files" v-bind:key="mimeType" class="d-none d-md-block" >
            <i :class="getIconClass(mimeType)" class="fa"/>
            <span v-for=" ({ url }, lang) in languages"  v-bind:key="lang" >
                <a target="_blank" :href="url" >
                    <span class="d-none d-md-inline language">
                        {{ lang| langTextFilter }}
                    </span>
                </a>
            </span>

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
  methods : { getIconClass, toggleDropdown, outSideClick },
  filters : { langTextFilter },
  data
}

function data(){ return { show: false} } 

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
  return langMap.get(langCode) || '' 
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
</style>