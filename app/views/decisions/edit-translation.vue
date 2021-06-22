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
                        <td class="border border-grey p-2"><span v-html="row.body.en" /></td>
                        <td class="border border-grey p-2">
                            <div v-if="rows[index].editor">
                                <ckeditor v-model="rows[index].editorHtml" :editor="editorType" :config="editorConfig"></ckeditor>
                                <div class="text-right">
                                    <span class="btn text-success" @click="save(row)"><i class="fa fa-check"></i></span>
                                    <span class="btn text-danger" @click="cancel(row)"><i class="fa fa-times"></i></span>
                                </div>
                            </div>
                            <div v-else class="paragraph" @click="edit(row)">
                                <span :lang="selectedLanguage" v-html="row.body[selectedLanguage]" />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import DecisionApi from '~/api/decisions.js';
import { cloneDeep } from 'lodash'
import ClassicEditor from 'ckeditor5';
import { component as ckeditor } from 'vue-ckeditor5'
import languages from '~/components/languages.js';

export default {
    name: 'DecisionEditTranslations',
    components : { ckeditor },
    props: {
        tokenReader: { type: Function, required: false }
    },
    data() {
        return {
            editorType: ClassicEditor,
            editorConfig: {
                toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList'],
            },
            selectedLanguage: 'fr',
            rows: [],
            nodes: [],
            decisionId: '60cb7860694e80b257c21639',
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

async function created() {
    this.api = new DecisionApi(this.tokenReader);
    const rowData = await this.api.queryDecisionNodes(this.decisionId);
    rowData.forEach(row=>{
        row.editor = false;
        row.editorHtml = '';
        row.body = row.body || {}
    });
    this.rows = rowData;
}
function edit(row) {
    row.editor = true;
    row.editorHtml = row.body[this.selectedLanguage] || '';
}

async function save(row) {
    row.editor = false;
    row.body[this.selectedLanguage] = row.editorHtml;
    row.editorHtml = '';
    await this.api.updateDecisionNode(this.decisionId, row._id, row.body);
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
  padding: 5px;
  border: dotted 1px #c0c0c0; 
}

[lang="ar"] {
  direction:rtl;
  text-align: right;
}
</style>