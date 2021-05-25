<template >
  <div>
    <ckeditor v-model="html" :editor="editorType" :config="editorConfig"></ckeditor>
    {{html}}
  </div>

</template>

<script>

import ClassicEditor from 'ckeditor5';
import { component as ckeditor } from 'vue-ckeditor5'

export default {
  name       : 'DecisionEditTranslations',
  components : { ckeditor },
  data
}

function data(){
  return { 
    editorType: ClassicEditor,
    editorConfig: {},
    html: '<p>hello</p>'
  }
}

</script>