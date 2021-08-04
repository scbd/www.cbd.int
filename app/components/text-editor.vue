<template>
<div>
  <ckeditor v-model="html" :editor="editorType" :config="editorConfig"></ckeditor>
</div>
</template>

<script>
import ClassicEditor from 'ckeditor5';
import { component as ckeditor } from 'vue-ckeditor5'

export const EditorTypes = {
  'Limited': ['bold', 'italic'],
  'Full' : ['bold', 'italic', 'bulletedList', 'numberedList']
}

export default {
    name: "TextEditor",
    components : { ckeditor },
    props: {
      html: {
        type: String,
        default: ''
      },
      type: {
        type: Array,
        default: EditorTypes.Limited,
      },
      locale: {
        type: String,
        default: 'en'
      }
    },
    data() {
      return {
        editorType: ClassicEditor,
      }
    },
    computed: {
      editorConfig() {
        return {
            toolbar: this.type || EditorTypes.Limited,
            language: {
                ui: 'en', // The UI will be English.
                content: this.locale
            }
        };
      },
    },
    watch: {
      html(val) {
        this.$emit('update:html', val);
      }
    }
}
</script>