<template>
    <div>
        <div>
            <table>
                <thead>
                    <tr class="text-center">
                        <td class="bg-primary text-white font-weight-bold">English</td>
                        <td class="bg-primary text-white font-weight-bold">
                            <select id="languages" v-model="selectedLanguage" class="w-50"
                            :disabled="isEditorOpen">
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
                    <tr v-for="(row, index) in rows" :key="index" v-show="!isEmpty(row.html)">
                        <td class="border border-grey p-2"><span v-html="row.html.en" /></td>
                        <td class="border border-grey p-2">
                            <div v-if="rows[index].editor">
                                <ckeditor v-model="rows[index].editorHtml" :editor="editorType" :config="editorConfig"></ckeditor>
                                <div class="text-right">
                                    <span class="btn text-success" @click="save(row)"><i class="fa fa-check"></i></span>
                                    <span class="btn text-danger" @click="cancel(row)"><i class="fa fa-times"></i></span>
                                </div>
                            </div>
                            <div v-else class="paragraph" @click="edit(row)">
                                <span :lang="selectedLanguage" v-html="row.html[selectedLanguage]" />
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
import { cloneDeep, isEmpty } from 'lodash'
import ClassicEditor from 'ckeditor5';
import { component as ckeditor } from 'vue-ckeditor5'
import languages from '~/components/languages.js';

export default {
    name: 'DecisionEditTranslations',
    components : { ckeditor },
    props: {
        tokenReader: { type: Function, required: false },
		route: { type: Object, required: false }
    },
    data() {
        return {
            editorType: ClassicEditor,
            selectedLanguage: 'fr',
            rows: [],
            nodes: [],
        }
    },
    computed: {

        editorConfig() {
            return {
                toolbar: [ 'bold', 'italic', 'bulletedList', 'numberedList'],
                language: {
                    ui: 'en', // The UI will be English.
                    content: this.selectedLanguage
                }
            };
        },
        languages() {
            const langs = cloneDeep(languages);
            delete langs.en;
            return langs;
        },
        isEditorOpen() {
            return this.rows.some((r) => r.editor);
        }
    },
    created,
    methods: {
        edit,
        save, 
        cancel,
        isEmpty
    }
}

async function created() {
    this.api = new DecisionApi(this.tokenReader);

	let treaty    = null ;
    const { route } = this;
	const body      = route.params.body.toUpperCase();
	const session   = parseInt(route.params.session);
	const number    = parseInt(route.params.decision);

	if(body=='COP') treaty = { code : "XXVII8" } ;

	if(!treaty) {
		//alert('ONLY "COP" DECISIONS ARE SUPPORTED');
		throw 'ONLY "COP" DECISIONS ARE SUPPORTED';
	}

	treaty = await this.api.getTreaties(treaty.code);

	const code = treaty.acronym+'/'+body+'/'+pad(session)+'/'+pad(number);


    const decision = await this.api.getDecision(code);

    // TODO Title

    const rowData = await this.api.queryDecisionNodes(code);
    rowData.forEach(row=>{
        row.editor = false;
        row.editorHtml = '';
        row.html = row.html || {}
    });
    this.rows = rowData;
}

function edit(row) {
    row.editor = true;
    row.editorHtml = row.html[this.selectedLanguage] || '';
}

async function save(row) {
    const html   = row.editorHtml;
    const locale = this.selectedLanguage;

    row.editor = false;
    row.editorHtml = '';

    const { decisionId } = row
    const data   = {
        html: { ...row.html, [locale]: html },
    }

    Object.keys(data.html).forEach((lang) => !data.html[lang] && delete data.html[lang]);
    
    const result = await this.api.updateDecisionNode(decisionId, row._id, data );
    
    row.html = result.html;
}

function cancel(row) {
    row.editor = false;
    row.editorHtml = '';
}

function pad(input) {

    var output = (input || '').toString();

    while(output.length<2)
        output = '0' + output;

    return output;
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