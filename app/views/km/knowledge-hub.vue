<template>
    <div>
        <a name="top"></a>

        <h1>KM-GBF Resources hub</h1>
        <div class="bg-white pt-2" >
            <div v-if="records!==null" class="container-fluid">
                <div class="row">
                    <div class="col-12 col-sm-6 col-lg-4">
                        <input class="form-control"  type="text" v-model.trim="filters.freeText" placeholder="Search by text..." @input="debouncedSearch()">
                    </div>
                    <div class="col-12 col-sm-6 col-lg-4">
                        <multiselect 
                            v-model="filters.gbfTargets" 
                            :options="lists.gbfTargets" 
                            placeholder="KM-GBF Targets..." 
                            label="name" 
                            track-by="identifier" 
                            @select="debouncedSearch()"
                            :multiple="true" 
                            :close-on-select="false" 
                            :clear-on-select="false"
                            :taggable="true"
                            :preserve-search="true">
                            <template #selection="{ values, isOpen }">
                                <span class="multiselect__single"
                                    v-if="values.length"
                                    v-show="!isOpen">{{ values.length }} target(s) selected</span>
                            </template>

                            <template #option="{ option }">
                                <div class="option__desc">
                                    <span class="option__title">
                                        {{ option.name }}
                                        <i>({{ facets[option.identifier] || 0 }})</i>
                                    </span>
                                </div>
                            </template>                            
                        </multiselect>      
                    </div>
                    <div class="col-12 col-sm-6 col-lg-4">
                        <multiselect 
                            v-model="filters.resourceTypes" 
                            :options="lists.resourceTypes.filter(o=>!o.broaderTerms || !o.broaderTerms.length)" 
                            placeholder="Resource Types..." 
                            label="name" 
                            track-by="identifier" 
                            @select="debouncedSearch()"
                            :multiple="true" 
                            :close-on-select="false" 
                            :clear-on-select="false"
                            :taggable="true"
                            :preserve-search="true">
                            <template #selection="{ values, isOpen }">
                                <span class="multiselect__single"
                                    v-if="values.length"
                                    v-show="!isOpen">{{ values.length }} resource type(s) selected</span>
                            </template>
                            <template #option="{ option }">
                                <div class="option__desc">
                                    <span class="option__title">
                                        {{ option.name }}
                                        <i>({{ facets[option.identifier] || 0 }})</i>
                                    </span>
                                </div>
                            </template>                            
                        </multiselect>      
                    </div>
                </div>
            </div>


            <div v-if="filters.freeText || selectGbfTargets.length || selectResourceTypes.length">
                <hr>


                <filter-tag v-if="filters.freeText" @remove="filters.freeText = ''">
                    {{filters.freeText}}
                </filter-tag>


                <filter-tag v-for="{ identifier, target, name }  of filters.gbfTargets" :key="identifier" :title="name" @remove="filters.gbfTargets = filters.gbfTargets.filter(t=>t.identifier !== identifier); debouncedSearch()">
                    Target {{ target }}
                </filter-tag>

                <filter-tag v-for="{ identifier, name }  of filters.resourceTypes" :key="identifier" @remove="filters.resourceTypes = filters.resourceTypes.filter(t=>t.identifier !== identifier); debouncedSearch()">
                    {{ name }}
                </filter-tag>
            </div>                

            <hr>
            
            <div v-if="records && recordCount!==null"  style="position: sticky; top:0px">
                {{ recordCount }} records found
            </div>
            
            <hr>
        </div>

        <div  ref="results" v-if="records!==null" class="container-fluid">
            <div class="row" v-if="display=='row'">
                <div class="col-12" v-for="record in records" :key="record.id">
                    <div class="container-fluid  border">
                        <div class="row">
                            <div class="col-2" style="max-height:150px; overflow:hidden">
                                <a :href="record.url_ss[0]" target="CHM">
                                <img :src="`https://picsum.photos/seed/${record.id}/200/150`" alt="...">
                                </a>
                            </div>
                            <div class="col-6" style="max-height:150px; overflow:hidden">
                                <h5 >{{record.title_t}}</h5>
                                <p>
                                    {{record.summary_t}}
                                </p>
                            </div>
                            <div class="col-4" style="max-height:150px; overflow:auto">
                                <a :href="record.url_ss[0]" class="btn btn-primary float-right m-2" target="CHM">View record</a>
                                <div v-if="record.publicationDate_dt">
                                </div> 
                                <div v-if="record.gbfTargets_ii">
                                    <b>Target(s):</b>
                                    <ul class="csv">
                                        <li class="csv" v-for="target in record.gbfTargets_ii" :key="target">
                                            <a target="target" :href="`https://www.cbd.int/gbf/targets/${encodeURIComponent(target)}`">{{ target }}</a>
                                        </li> 
                                    </ul>
                                </div>
                                <div v-if="record.resourceTypes_EN_txt">
                                    <b>Resource Type</b>: 
                                    <ul class="csv">
                                        <li class="csv" v-for="resource in record.resourceTypes_EN_txt" :key="resource">
                                            {{ resource }}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" v-else>
                <div class="col-12 col-sm-6 col-lg-4 mb-1" v-for="record in records" :key="record.id">
                    <div class="card">
                        <img :src="`https://fakeimg.pl/385x250/cccccc/777777?text=${encodeURIComponent((record.resourceTypes_EN_txt||[]).join(',\n'))}`" class="card-img-top" alt="...">
                        <!-- <img :src="`https://picsum.photos/seed/${record.id}/300/200`" class="card-img-top" alt="..."> -->
                        <div class="card-body">
                            <h5 class="card-title">{{record.title_t}}</h5>
                            <p class="card-text" style="max-height:200px;min-height:50px; overflow:auto">
                                {{record.summary_t}}
                            </p>
                            <a :href="record.url_ss[0]" class="btn btn-primary" target="CHM">View record</a>
                        </div>
                        <div class="card-footer">
                            <div v-if="record.publicationDate_dt">
                                <b>Published</b>: {{ record.publicationDate_dt.substr(0, 10) }}
                            </div> 
                            <div v-if="record.gbfTargets_ii">
                                <b>Target(s):</b>
                                <ul class="csv">
                                    <li class="csv" v-for="target in record.gbfTargets_ii" :key="target">
                                        <a target="target" :href="`https://www.cbd.int/gbf/targets/${encodeURIComponent(target)}`">{{ target }}</a>
                                    </li>
                                </ul>   
                            </div>
                            <div v-if="record.resourceTypes_EN_txt">
                                <b>Resource Type</b>: 
                                <ul class="csv">
                                    <li class="csv" v-for="resource in record.resourceTypes_EN_txt" :key="resource">{{ resource }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <hr>

        <div class="text-center m-1" v-if="recordCount>records.length">
            Showing {{ records.length  }} of {{  recordCount }} records. 
            <button type="button" class="btn btn-dark" @click="pageSize+=9; search()">Load more...</button>
        </div>
    </div>
</template>

<script>
import SolrApi from '../../api/solr';
import ThesaurusApi from '../../api/thesaurus';
import _ from 'lodash';
import Multiselect from 'vue-multiselect'
import FilterTag from './knowledge-hub/filter-tag.vue'
import uploadStatementButtonVue from '../../components/meetings/upload-statement-button.vue';


const solr = new SolrApi();
const thesaurus = new ThesaurusApi();

export default {
    components : { Multiselect, FilterTag },
    data(){
        return{
            display: (window.location.hash||'').replace(/^#/, ''),
            records: null,
            recordCount: null,
            pageSize: 9,
            facets: {},
            filters: {
                freeText: "",
                gbfTargets: [],
                resourceTypes: [],
            },
            lists: {
                gbfTargets: [],
                resourceTypes: []
            }
        }
    },
    computed : {
        selectGbfTargets()    {  return this.filters.gbfTargets   .map(o=>o.identifier).sort(); },
        selectResourceTypes() {  return this.filters.resourceTypes.map(o=>o.identifier); }
    },
    created,
    methods: {
        search,
        updateFacets,
        getQueryParts,
        debouncedSearch :  _.debounce(async function(){
            this.pageSize = 9;
            await this.search();
            await this.updateFacets();
            document.body.scrollIntoView({ behavior:'smooth'});
        }, 250),
    }
}

//===========================================
//
//===========================================
async function search() {

    const queryParts   = this.getQueryParts();
    const queryEntries = Object.values(queryParts).filter(o=>o);

    const tmpFilter = `resourceTypes_REL_ss: ( ${ this.lists.resourceTypes.map(o=>o.identifier).join(' ') } )`

    const query = AND(...queryEntries, tmpFilter);



    const { response } = await queryIndex(query, { l: this.pageSize });

    this.recordCount = response.numFound;
    this.records = response.docs.map(o=>{
        o.gbfTargets_ss = o.gbfTargets_ss || o.aichiTargets_REL_ss?.filter(o=>/^GBF-TARGET-/.test(o));

        o.gbfTargets_ii = o.gbfTargets_ss.map(o=>parseInt(o.replace(/^GBF-TARGET-/, '')));
        
        o.gbfTargets_EN_txt = o.gbfTargets_EN_txt || o.gbfTargets_ss
            ?.filter(o=>/^GBF-TARGET-/.test(o))
            ?.map   (o=>this.lists.gbfTargets.find(t=>t.identifier==o).title.en)

            o.resourceTypes_EN_txt = o.resourceTypes_REL_ss.map(id=> this.lists.resourceTypes.find(o=>o.identifier == id) ).filter(o=>o).map(o=>o.name);
        return o;
    });
}

function getQueryParts() {
    const { filters, selectGbfTargets, selectResourceTypes } = this;

    let gbf  = null;
    let type = null;
    let freeText = null;

    if(!_.isEmpty(selectGbfTargets))    gbf  = `aichiTargets_REL_ss:(${selectGbfTargets   .map(code=>solr.escape(code)).join(' ')})`;
    if(!_.isEmpty(selectResourceTypes)) type = `resourceTypes_REL_ss:(${selectResourceTypes.map(code=>solr.escape(code)).join(' ')})`;
    if(!_.isEmpty(filters.freeText)) {
        const andWords = AND(...filters.freeText.split(' ').filter(w=>!!w).map(w=> `${solr.escape(w)}~`)); // ~ => fuzzy search (mispelled)
        
        freeText = OR(`title_t:${andWords}`, `summary_t:${andWords}`, `text_EN_txt:${andWords}`);
    }

    return { gbf, type, freeText };
}

//===========================================
//
//===========================================
async function created() {

    const qFacets     = this.updateFacets();
    let gbfTargets    = getDomainTerms('GBF-TARGETS');
    let resourceTypes = getDomainTerms('663C02F8-78C2-4A27-A45D-1AD27F920363'); // KM Hub types
    //resourceTypes = getDomainTerms('A762DF7E-B8D1-40D6-9DAC-D25E48C65528'); // VLR types 
    
    gbfTargets    = await gbfTargets;
    resourceTypes = await resourceTypes;
    await qFacets;
    
    this.lists.gbfTargets     = gbfTargets   .map((t=>({ ...t, name: termName(t), target : targetCodeToNumber(t.identifier) })));
    this.lists.resourceTypes  = resourceTypes.map((t=>({ ...t, name: termName(t) })));

    await this.search();
}
function termName(term) {
    return term.shortTitle.en || term.title?.en || term.name || term.identifier;
}

function targetCodeToNumber(code) {
    return parseInt(code.replace(/.*?(\d+)$/, '$1'));
}

//===========================================
//
//===========================================
async function getDomainTerms(code) {
    let terms = await thesaurus.getDomainTerms(code);

    terms.forEach((term)=>{
        term.broaderTerms  = term.broaderTerms .map(id => terms.find(t=> t.identifier == id)).filter(o=>o);
        term.narrowerTerms = term.narrowerTerms.map(id => terms.find(t=> t.identifier == id)).filter(o=>o);
    })

    return terms;
}

const baseIndexQuery = AND('schema_s:resource', 'realm_ss:(CHM BCH ABSCH)', 'aichiTargets_REL_ss:GBF-TARGET-*', 'resourceTypes_REL_ss:*');

//===========================================
//
//===========================================
async function queryIndex(query, { sk: start, l: rows} = {}) {

    query = AND(baseIndexQuery, query);

    const result = await solr.query(query, { start , rows });

    return result;
}

function AND(...parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' AND ' )})` : null; }
function OR (...parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' OR '  )})` : null; }

//===========================================
//
//===========================================
async function updateFacets() {

const { gbf, type, freeText }  = this.getQueryParts();

let gbfFacets  = getFacets(AND(freeText, type), 'aichiTargets_REL_ss');
let typeFacets = getFacets(AND(freeText,  gbf), 'resourceTypes_REL_ss');

gbfFacets  = await gbfFacets;
typeFacets = await typeFacets;

this.facets = { ...gbfFacets, ...typeFacets };
}


//===========================================
//
//===========================================
async function getFacets(query, field) {

    query = AND(baseIndexQuery, query);

    const options = {
        facetField: [field],
        rows : 0,
    }

    const result = await solr.query(query, options);
    const rawfacets = result?.facet_counts?.facet_fields;
    const facets = {};

    Object.values(rawfacets).forEach((value) => {
        for(let i=0; i<value.length; i+=2) {
            const identifier = value[i];
            const count       = value[i+1];
            facets[identifier] = count;
        }
    });

    return facets;
}

//===========================================
//
//===========================================
function toData({data}) {
    return data;
}
</script>

<style lang="css" scoped>
    .w-20 {
        width: 20%
    }
</style>

<style lang="css">
    .multiselect .multiselect__content-wrapper {
        min-width: 100%;
        width: auto;
        border: none;
        box-shadow: 4px 4px 10px 0 rgba(0,0,0,.1);
    }

    ul.csv {
        display:inline;  
        list-style:none; 
        padding-left: 0px;       
        padding-right: 0px;       
    }

    ul.csv > li {
        display:inline;  
    }

    li.csv ~ li.csv::before {
         content: ", ";
      }

</style>