<template>
    <div>
        <a name="top"></a>

        <h1>Proof of Concept - FAO equivalent Tool based on CBD Clearing-Houses Virtual Library (VLR)</h1>
        <div class="bg-white pt-2" >
            <div v-if="records!==null" class="container-fluid">
                <div class="row">
                    <div class="col-12 col-sm-6 col-lg-3">
                        <input class="form-control"  type="text" v-model.trim="filters.freeText" placeholder="Search by text..." @input="debouncedSearch()">
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3">
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
                                        <i>({{ facets.gbfTargets[option.identifier] }})</i>
                                    </span>
                                </div>
                            </template>                            
                        </multiselect>      
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3">
                        <multiselect 
                            v-model="filters.resourceTypes" 
                            :options="lists.resourceTypes" 
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
                                        <i>({{ facets.resourceTypes[option.identifier] }})</i>
                                    </span>
                                </div>
                            </template>                            
                        </multiselect>      
                    </div>
                </div>
            </div>


            <div v-if="filters.freeText || selectGbfTargets.length || selectResourceTypes.length">
                <hr>


                <span v-if="filters.freeText" class="badge badge-info mr-2">
                    {{filters.freeText}}
                    <a href="#" class="text-danger" @click.prevent="filters.freeText = ''">&times;</a>
                </span>


                <span v-for="{ identifier, target, name }  of filters.gbfTargets" :key="identifier" :title="name" class="badge badge-info mr-2">
                    Target {{ target }}
                    <a href="#" class="text-danger" @click.prevent="filters.gbfTargets = filters.gbfTargets.filter(t=>t.identifier !== identifier); debouncedSearch()">&times;</a>
                </span>

                <span v-for="{ identifier, name }  of filters.resourceTypes" :key="identifier" class="badge badge-info mr-2">
                    {{ name }}
                    <a href="#" class="text-danger" @click.prevent="filters.resourceTypes = filters.resourceTypes.filter(t=>t.identifier !== identifier); debouncedSearch()">&times;</a>
                </span>

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
                                    <a class="mr-4" target="target" :href="`https://www.cbd.int/gbf/targets/${encodeURIComponent(target)}`" v-for="target in record.gbfTargets_ii" :key="target">{{ target }}</a>
                                </div>
                                <div v-if="record.resourceTypes_EN_txt">
                                    <b>Resource Type</b>: {{ record.resourceTypes_EN_txt.join(', ') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" v-else>
                <div class="col-12 col-sm-6 col-lg-4 mb-1" v-for="record in records" :key="record.id">
                    <div class="card">
                        <img :src="`https://picsum.photos/seed/${record.id}/300/200`" class="card-img-top" alt="...">
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
                                <a class="mr-2" target="target" :href="`https://www.cbd.int/gbf/targets/${encodeURIComponent(target)}`" v-for="target in record.gbfTargets_ii" :key="target">{{ target }}</a>
                            </div>
                            <div v-if="record.resourceTypes_EN_txt">
                                <b>Resource Type</b>: {{ record.resourceTypes_EN_txt.join(', ') }}
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


const solr = new SolrApi();
const thesaurus = new ThesaurusApi();

export default {
    components : { Multiselect },
    data(){
        return{
            display: (window.location.hash||'').replace(/^#/, ''),
            records: null,
            recordCount: null,
            pageSize: 9,
            facets: {
                gbfTargets: {},
                resourceTypes: {}
            },
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
        debouncedSearch :  _.debounce(async function(){
            this.pageSize = 9;
            await this.search();
            document.body.scrollIntoView({ behavior:'smooth'});
        }, 250),
    }
}

//===========================================
//
//===========================================
async function search() {

    const { filters, selectGbfTargets, selectResourceTypes } = this;
    const queryEntries = [];


    if(!_.isEmpty(selectGbfTargets))    queryEntries.push(`aichiTargets_REL_ss: (${selectGbfTargets   .map(code=>solr.escape(code)).join(' ')})`);
    if(!_.isEmpty(selectResourceTypes)) queryEntries.push(`resourceTypes_ss:    (${selectResourceTypes.map(code=>solr.escape(code)).join(' ')})`);
    if(!_.isEmpty(filters.freeText)) {
        const words = filters.freeText.split(' ').filter(w=>!!w).map(w=> `${solr.escape(w)}~`); // ~ => fuzzy search (mispelled)
        const fields = [
            'title_t', 
            'summary_t', 
            //'text_EN_txt'
        ];

        const OR = fields.map(f=> `${f} : (${ words.join(' AND ')})`);

        queryEntries.push(`(${OR.join(' OR ')})`);
    }      

    const query = queryEntries.join(' AND ');

    const { response } = await queryIndex(query, { l: this.pageSize });

    this.recordCount = response.numFound;
    this.records = response.docs.map(o=>{
        o.gbfTargets_ss = o.gbfTargets_ss || o.aichiTargets_REL_ss?.filter(o=>/^GBF-TARGET-/.test(o));

        o.gbfTargets_ii = o.gbfTargets_ss.map(o=>parseInt(o.replace(/^GBF-TARGET-/, '')));
        
        o.gbfTargets_EN_txt = o.gbfTargets_EN_txt || o.gbfTargets_ss
            ?.filter(o=>/^GBF-TARGET-/.test(o))
            ?.map   (o=>this.lists.gbfTargets.find(t=>t.identifier==o).title.en)
        return o;
    });
}


//===========================================
//
//===========================================
async function created() {

    let facets        = getFacets();
    let gbfTargets    = getDomainTerms('GBF-TARGETS');
    let resourceTypes = getDomainTerms('A762DF7E-B8D1-40D6-9DAC-D25E48C65528');
    
    facets        = await facets;
    gbfTargets    = await gbfTargets;
    resourceTypes = await resourceTypes;

    this.facets.gbfTargets    = facets.aichiTargets_REL_ss;
    this.facets.resourceTypes = facets.resourceTypes_ss;
    
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
    return await thesaurus.getDomainTerms(code);
}

const baseIndexQuery = 'schema_s:resource AND realm_ss:(CHM BCH ABSCH) AND aichiTargets_REL_ss:GBF-TARGET-*';

//===========================================
//
//===========================================
async function queryIndex(query, { sk: start, l: rows} = {}) {

    query = _.compact([baseIndexQuery, query]).filter(o=>!!o).join(' AND ');

    const result = await solr.query(query, { start , rows });

    return result;
}

//===========================================
//
//===========================================
async function getFacets(query) {

    query = [baseIndexQuery, query].filter(o=>!!o).join(' AND ');

    const options = {
        facetField: ['resourceTypes_ss','aichiTargets_REL_ss'],
        rows : 0,
    }

    const result = await solr.query(query, options);
    const rawfacets = result?.facet_counts?.facet_fields;
    const keyPairs = Object.entries(rawfacets);
    const facets = {};

    keyPairs.forEach(([key, value]) => {

        facets[key] = {};

        for(let i=0; i<value.length; i+=2) {
            const identifier = value[i];
            const count       = value[i+1];
            facets[key][identifier] = count;
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

</style>