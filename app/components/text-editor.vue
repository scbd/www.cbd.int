<template>
<div>
  <ckeditor v-model="html" :editor="editorType" :config="editorConfig"></ckeditor>
</div>
</template>

<script>
import ClassicEditor from 'ckeditor5';
import { component as ckeditor } from 'vue-ckeditor5'

export const EditorTypes = {
  'Limited': ['heading', '|', 'bold', 'italic', 'link'],
  'Full' : ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo']
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
            toolbar: {
              items: this.type || EditorTypes.Limited
            },
            image: this.type == EditorTypes.Full ? {toolbar: ['imageTextAlternative','imageStyle:inline','imageStyle:block','imageStyle:side']} : {},
            table: this.type === EditorTypes.Full ? {contentToolbar: ['tableColumn','tableRow','mergeTableCells']} : {},
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