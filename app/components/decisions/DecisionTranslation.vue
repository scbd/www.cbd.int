<template>
    <div>
        <div>
            <table>
                <thead>
                    <tr>
                        <td>English</td>
                        <td>
                            <select class="form-control" id="languages" v-model="selectedLanguage">
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
                        <td><span v-html="row.en" /></td>
                        <td>
                            <div v-if="rows[index].editor">
                                <ckeditor v-model="rows[index].editorHtml" :editor="editorType" :config="editorConfig"></ckeditor>
                                <div class="text-right">
                                    <span class="btn text-success" @click="save(row)"><i class="fa fa-check"></i></span>
                                    <span class="btn text-danger" @click="cancel(row)"><i class="fa fa-times"></i></span>
                                </div>
                            </div>
                            <div v-else v-html="row[selectedLanguage]"  @click="edit(row)" />
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
            editorConfig: {},
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

table thead tr {
    text-align: center;
    background-color:#6F5495!important;
    color:white!important;
    font-family: "Helvetica Neue", Helvetica, sans-serif, "Trebuchet MS";
    font-size: 14px;
    font-weight: bold;
    -webkit-font-smoothing:antialiased;
    padding: 10px 16px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.16), 0 0 6px rgba(0, 0, 0, 0.23);
    border-bottom-color: rgb(221, 221, 221);
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-left-color: rgb(221, 221, 221);
    border-right-color: rgb(221, 221, 221);
    border-top-color: rgb(221, 221, 221);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
}

table tbody tr td { 
    padding: 10px 5px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}
</style>