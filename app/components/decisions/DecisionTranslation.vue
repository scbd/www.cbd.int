<template>
    <div>
        <div>
            <table>
                <thead>
                    <tr class="text-center">
                        <td class="bg-primary text-white font-weight-bold">English</td>
                        <td class="bg-primary text-white font-weight-bold">
                            <select id="languages" v-model="selectedLanguage" class="w-50 ">
                                <option 
                                    v-for="(language, locale) in languages"
                                    :key="locale" 
                                    :value="locale">
                                    {{language}}
                                </option>
                            </select>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows" :key="index">
                        <td class="border border-grey p-2"><span v-html="row.en" /></td>
                        <td class="border border-grey p-2">
                            <div v-if="rows[index].editor">
                                <ckeditor v-model="rows[index].editorHtml" :editor="editorType" :config="editorConfig"></ckeditor>
                                <div class="text-right">
                                    <span class="btn text-success" @click="save(row)"><i class="fa fa-check"></i></span>
                                    <span class="btn text-danger" @click="cancel(row)"><i class="fa fa-times"></i></span>
                                </div>
                            </div>
                            <div v-else :lang="selectedLanguage" v-html="row[selectedLanguage]" class="paragraph" @click="edit(row)" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import ClassicEditor from 'ckeditor5';
import { component as ckeditor } from 'vue-ckeditor5'
import rows from '~/data/decisions/text-info.json';
import languages from '~/components/languages.js';

export default {
    name: 'DecisionEditTranslations',
    components : { ckeditor },
    data() {
        return {
            editorType: ClassicEditor,
            editorConfig: {
                toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList'],
            },
            selectedLanguage: 'fr',
            rows,
        }
    },
    computed: {
        languages() {
            const langs = cloneDeep(languages);
            delete langs.en;
            return langs;
        } 
    },
    created,
    methods: {
        edit,
        save, 
        cancel
    }
}

function created() {
    rows.forEach(row=>{
        row.editor = false;
        row.editorHtml = '';
    });
}
function edit(row) {
    row.editor = true;
    row.editorHtml = row[this.selectedLanguage] || '';
}

function save(row) {
    row.editor = false;
    row[this.selectedLanguage] = row.editorHtml;
    row.editorHtml = '';
}

function cancel(row) {
    row.editor = false;
    row.editorHtml = '';
}

</script>


<style scoped>
table {
    width: 100%;
}

table td {
    width: 50%;
}

.paragraph {
  min-height:15px;
  border: dotted 1px #c0c0c0; 
}

[lang="ar"] {
  direction:rtl
}
</style>