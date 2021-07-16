
<template >
  <div style="white-space: normal; text-align: left" class="modal fade bd-example-modal-lg" ref="preview" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">

        <div class="modal-header">
          <h3 class="modal-title">
            Preview
            <input v-model="searchText" type="text" ref="search" class="form-control" @input="search()" @change="search(true)" placeholder="Search..."/>
            <small v-if="searchMatches!==null" style="display:inline-block">{{searchMatches}} match(es) found</small>
          </h3>
          
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
                      
        </div>
        <div class="modal-body">
          <p ref="text" class="preview" :lang="language">{{cleanText}}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>    
</template>

<script>

import Vue from 'Vue';
import Mark from 'mark';
import { debounce } from 'lodash';

const TextPreviewDialog = {
  name    :  'TextPreviewDialog',
  props   : {
              text:     { type: String,  required: true  },
              language: { type: String,  required: false },
              show:     { type: Boolean, required: false, default: false }
            },
  computed: {
    cleanText() { 
      return (this.text||'').replace(/\n+/g, '\n').trim();
    }
  },
  data() { 
    return {
      searchText: '',
      searchMatches: null
    };
  },
  methods: { open, search: debounce(search, 500) },
  watch:   { show: open },
  mounted
}

function open(visible) {
  const dialog = $(this.$refs.preview);

  if(visible) { 
    dialog.modal('show'); 
  }
  else { 
    dialog.modal('hide'); 
  }
}

function search(scroll) {
  const text = this.searchText;

  this.marker.unmark({});
  this.marker.mark(text, {className:  "marked"});

  const matches = $(this.$refs.text).find("mark");

  this.searchMatches = text ? matches.length : null;

  if(scroll && this.searchMatches) {
    $(this.$refs.search).blur();
    this.$nextTick(()=>{
      const preview = $(this.$refs.preview);
      preview.scrollTop($(matches[0]).offset().top - preview.offset().top);    
    })
  }
}

function mounted() {

  this.marker = new Mark(this.$refs.text);

  $(this.$refs.preview).on('shown.bs.modal',  ()=> $(this.$refs.search).focus() );
  $(this.$refs.preview).on('hidden.bs.modal', ()=> this.$emit('close') );

  if(this.show)
    this.open(true);
}

export default TextPreviewDialog;

export function showPreview(text, language) {

  const Dialog = Vue.extend(TextPreviewDialog);

  const vm = new Dialog({
    propsData: { text, language, show:true }
  });

  vm.$once('close', ()=> { 
    vm.$destroy(); 
    $(vm.$el).remove()
  });

  const mountingPoint = $("<div></div>");

  $("body").append(mountingPoint);
  
  vm.$mount(mountingPoint[0])
}

</script>

<style scoped>
.form-control {
  display: inline;
  width: 200px;
  margin-left: 50px;
  margin-right: 10px;
}
.preview {
  white-space: pre-wrap;
  font-size:15pt;
  line-height:25pt;
  font-family:Arial;
}

p[lang="ar"] {
  direction:rtl;
  text-align: right;
}

.modal-xl {
  max-width: 80%;
}
</style>

<style>
.marked {
  background-color: red;
  color: white;
}
</style>