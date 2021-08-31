<template>
    <div>
        <div>
            <table>
                <thead>
                    <tr class="text-center">
                        <td class="bg-primary text-white font-weight-bold">English</td>
                        <td class="bg-primary text-white font-weight-bold">
                            <select id="languages" v-model="selectedLanguage" class="badge"
                            :disabled="isEditorOpen">
                                <option 
                                    v-for="(language, locale) in languages"
                                    :key="locale" 
                                    :value="locale">
                                    {{language}}
                                </option>
                            </select>
                            <span class="float-right" style="background: white" v-show="isEditorOpen">
                                <a href="javascript:void(0)" class="text-success mx-1" @click="saveAll"><i class="fa fa-check"></i></a>
                                <a href="javascript:void(0)" class="text-danger mx-1" @click="cancelAll"><i class="fa fa-times"></i></a>
                            </span>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows" :key="index" v-show="!isEmpty(row.html)">
                        <td class="border border-grey p-2"><span v-html="row.html.en" /></td>
                        <td class="border border-grey p-2">
                            <div v-if="rows[index].editor">
                                <text-editor :html.sync="editorHtml" :locale="selectedLanguage" />
                                <div class="text-right">
                                    <span class="btn text-success" @click="save(row)"><i class="fa fa-check"></i></span>
                                    <span class="btn text-danger" @click="cancel(row)"><i class="fa fa-times"></i></span>
                                </div>
                            </div>
                            <div v-else class="paragraph" @click="edit(row)">
                                <span v-if="row.html[selectedLanguage]" :lang="selectedLanguage" v-html="row.html[selectedLanguage]" />
                                <span v-else class="text-muted">&lt;click to add translation&gt;</span>
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
import TextEditor, { EditorTypes } from '~/components/text-editor.vue';
import languages from '~/data/languages.js';

export default {
    name: 'DecisionEditTranslations',
    components : { TextEditor },
    props: {
        tokenReader: { type: Function, required: false },
		route: { type: Object, required: false }
    },
    data() {
        return {
            selectedLanguage: 'fr',
            rows: [],
            nodes: [],
        }
    },
    computed: {
        EditorTypes() { return EditorTypes},
        editorConfig() {
            return {
                toolbar: [ 'bold', 'italic'],
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
        saveAll,
        cancelAll,
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

async function saveAll() {
    const {rows} = this;
    const openRows = rows.filter((r) => r.editor);
    openRows.forEach(r => this.save(r));
}

async function cancelAll() {
    const {rows} = this;
    rows.forEach(r => {
        r.editor = false;
        r.editorHtml = '';
    })
}

async function save(row) {
    const html   = row.editorHtml;
    const locale = this.selectedLanguage;

    const { decisionId } = row
    
    const result = await this.api.updateDecisionNodeText(decisionId, row._id, locale, html );
    
    row.html = result;
    row.editor = false;
    row.editorHtml = '';
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