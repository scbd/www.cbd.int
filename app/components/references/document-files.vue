<template>
    <div class="document-files">
        <div class="hidden-xs" v-for="(languages, type) in byTypes" :key="type">
            <i :class="`fa ${(MIMES[type] || MIMES.default).icon}`" :style="{color: MIMES[type].color}"></i>
            <span v-for="(file, language) in languages" :key="language">
                <a target="_blank" :href="file.url" @click="$event.stopPropagation();">
                    <span class="visible-md-inline visible-lg-inline visible-xl-inline language">
                        {{LANGUAGES[language] || language}}
                    </span>
                    <span class="language visible-xs-inline visible-sm-inline">{{language}}</span>
                </a>
            </span>
        </div>
        <div class="visible-xs dropdown">
            <button type="button" class="btn btn-default btn-lg dropdown-toggle" 
                data-toggle="dropdown" aria-expanded="true">
                <i class="fa fa-arrow-circle-down" style="font-size:1.25em"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-right" role="menu">
                <li role="presentation" class="dropdown-header">Select a file to download</li>
                <li 
                    v-for="(types, language) in byLanguages"
                    :key="language"
                    role="presentation" 
                    class="dropdown-item"
                    style="font-size:16px;margin:4px 0px;white-space:nowrap;">

                    <a role="menuitem" tabindex="-1" style="display:inline-block;width:120px;font-size:inherit;" class="language">
                        {{LANGUAGES[language] || language}}
                    </a>
                    <span>
                        <a 
                            v-for="(file,type) in types" 
                            :key="type"
                            :class="`btn btn-sm ${MIMES[type].btn || 'btn-default'}`"
                            style="margin-right:5px;font-size:16px;"
                            target="_blank"  
                            :href="file.url">
                            <i :class="`fa ${(MIMES[type] || MIMES.default).icon}`"></i>
                        </a>
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import LANGUAGES from '~/components/languages.js';
import MIMES from '~/components/file-type.js';

export default {
    name: 'DocumentTypes',
    props: {
        files: {
            type: Object,
            default: () => []
        }
    },
    computed: {
        LANGUAGES() {return LANGUAGES;},
        MIMES() {return MIMES;},
        byTypes() {return byTypes.call(this)},
        byLanguages() {return byLanguages.call(this)}
    },
}

function byTypes() {
    const { files } = this;
    
    if(!files || files.length === 0) return [];

    const result = {};

    _(files||[]).sort(function(a,b) {
        return sortByType(a,b) || sortByLanguage(a,b);
    }).forEach(function(f){
        result[f.type] = result[f.type] || {};
        result[f.type][f.language] = f;
    }).value();
    
    return result;
}

function byLanguages() {
    const { files } = this;

    const byLanguages = {};

    _(files || []).sort(function(a,b) {
        return sortByLanguage(a,b) || sortByType(a,b);
    }).forEach(function(f){
        byLanguages[f.language] = byLanguages[f.language]   || {};
        byLanguages[f.language][f.type] = f;
    }).value();

    return byLanguages;
}

function sortByType(a,b) {
    if(MIMES[a.type] || MIMES[b.type]) {
        a = (MIMES[a.type]||MIMES.default).priority;
        b = (MIMES[b.type]||MIMES.default).priority;
    }

    if(a<b) return -1;
    if(a>b) return  1;
    return 0;
}

function sortByLanguage(a,b) {
    if(a.language<b.language) return -1;
    if(a.language>b.language) return  1;
    return 0;
}

</script>