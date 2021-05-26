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
                                    v-for="lang in Object.keys(languages)"
                                    :key="lang" 
                                    :value="lang">
                                    {{languages[lang]}}
                                </option>
                            </select>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in docRows" :key="index">
                        <td><span v-html="row.en" /></td>
                        <td>
                            <div v-if="docRows[index].editor">
                                <ckeditor v-model="editorHtml" :editor="editorType" :config="editorConfig"></ckeditor>
                                <div class="float-right">
                                    <span class="btn text-success" @click="save(row, index)"><i class="fa fa-check"></i></span>
                                    <span class="btn text-danger" @click="cancel(row, index)"><i class="fa fa-times"></i></span>
                                </div>
                            </div>
                            <span v-else v-html="row[selectedLanguage]"  @click="handleRowClick(row, index)" />
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
import docRows from '~/data/decisions/text-info.json';
import languages from '~/components/languages.js';

export default {
    name: 'DecisionEditTranslations',
    components : { ckeditor },
    data() {
        return {
            editorType: ClassicEditor,
            editorConfig: {},
            editorHtml: '',
            selectedLanguage: 'fr',
            docRows,
        }
    },
    computed: {
        languages() {
            const langs = cloneDeep(languages);
            delete langs.en;
            return langs;
        } 
    },
    methods: {
        handleRowClick,
        save, 
        cancel
    }
}

function handleRowClick(row, index) {
    row.editor = true;
    this.editorHtml = this.docRows[index][this.selectedLanguage] || '';
    this.$set(this.docRows, index, row);
}

function save(row, index) {
    row.editor = false;
    row[this.selectedLanguage] = this.editorHtml;
    this.editorHtml = '';
    this.$set(this.docRows, index, row);
}

function cancel(row, index) {
    row.editor = false;
    this.editorHtml = '';
    this.$set(this.docRows, index, row);
}

</script>


<style scoped>
table {
    width: 100%;
}

table td {
    width: 50%;
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