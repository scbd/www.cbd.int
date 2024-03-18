<template>
    <div>
        <a name="top"></a>
        <div class="bg-white pt-2" style="position: sticky; top:0px;z-index: 1">
            <h1>PoC FAO Tool based on CLearinh-Houses Virtual Library (VLR)</h1>
            <div v-if="records!==null" class="container-fluid">
                <div class="row">
                    <div class="col-12 col-sm-6 col-lg-3">
                        <input class="form-control"  type="text" v-model.trim="filters.freeText" placeholder="Search by text..." @input="debouncedSearch()">
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3">
                        <select class="form-control" v-model="filters.aichiTargets" placeholder="Aichi Targets" @change="debouncedSearch()">
                            <option :value="null">Aichi Targets...</option>
                            <option v-for="({identifier, title}) in lists.aichiTargets.filter(({identifier})=>facets.aichiTargets[identifier])" :key="identifier" :value="identifier">
                                {{ title.en || title }}
                                ({{ facets.aichiTargets[identifier] }})
                            </option>
                        </select>
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3">
                        <select class="form-control" v-model="filters.cbdSubjects" placeholder="Subjects" @change="debouncedSearch()">
                            <option :value="null">Subjects...</option>
                            <option v-for="({identifier, title}) in lists.cbdSubjects.filter(({identifier})=>facets.cbdSubjects[identifier])" :key="identifier" :value="identifier">
                                {{ title.en || title }}
                                ({{ facets.cbdSubjects[identifier] }})
                            </option>
                        </select>
                    </div>
                    <div class="col-12 col-sm-6 col-lg-3">
                        <select class="form-control" v-model="filters.resourceTypes" placeholder="Type of Resouces" @change="debouncedSearch()">
                            <option :value="null">Resource Types...</option>
                            <option v-for="({identifier, title}) in lists.resourceTypes.filter(({identifier})=>facets.resourceTypes[identifier])" :key="identifier" :value="identifier">
                                {{ title.en || title }}
                                ({{ facets.resourceTypes[identifier] }})
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <hr>
            
            <div v-if="records && recordCount!==null"  style="position: sticky; top:0px">
                {{ recordCount }} records found
            </div>
            
            <hr>
        </div>

        <div  ref="results" v-if="records!==null" class="container-fluid">
            <div class="row">
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
                            <span v-if="record.publicationDate_dt">
                                <b>Published</b>: {{ record.publicationDate_dt.substr(0, 10) }}<br>
                            </span> 
                            <span v-if="record.cbdSubjects_EN_txt">
                                <b>Subject</b>: {{ record.cbdSubjects_EN_txt.join(', ') }}<br>
                            </span>
                            <span v-if="record.aichiTargets_EN_txt">
                                <b>Target</b>: {{ record.aichiTargets_EN_txt.join(', ') }}<br>
                            </span>
                            <span v-if="record.resourceTypes_EN_txt">
                                <b>Resource Type</b>: {{ record.resourceTypes_EN_txt.join(', ') }}<br>
                            </span>
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
import axios from 'axios'
import _ from 'lodash';

const api = axios.create({ baseURL: 'https://api.cbd.int/'});


export default {
    components : {  },
    data(){
        return{
            records: null,
            recordCount: null,
            pageSize: 9,
            facets: {
                aichiTargets: {},
                cbdSubjects: {},
                resourceTypes: {}
            },
            filters: {
                freeText: "",
                aichiTargets: null,
                cbdSubjects: null,
                resourceTypes: null,
            },
            lists: {
                aichiTargets: [],
                cbdSubjects: [],
                resourceTypes: []
            }
        }
    },
    created,
    methods: {
        search,
        debouncedSearch :  _.debounce(async function(){
            this.pageSize = 9;
            await this.search();
            document.body.scrollIntoView({ behavior:'smooth'});
        }, 250)
    }
}

//===========================================
//
//===========================================
async function search() {

    const { filters } = this;
    const queryEntries = [];


    if(!_.isEmpty(filters.aichiTargets))  queryEntries.push(`aichiTargets_ss:  (${_.flatten([filters.aichiTargets]).join(' ')})`);
    if(!_.isEmpty(filters.cbdSubjects))   queryEntries.push(`cbdSubjects_ss:   (${_.flatten([filters.cbdSubjects]).join(' ')})`);
    if(!_.isEmpty(filters.resourceTypes)) queryEntries.push(`resourceTypes_ss: (${_.flatten([filters.resourceTypes]).join(' ')})`);
    if(!_.isEmpty(filters.freeText)) {
        const words = filters.freeText.split(' ').filter(w=>!!w).map(w=> `${w}~`); // ~ => fuzzy search (mispelled)
        const fields = [
            'title_t', 
            'summary_t', 
            //'text_EN_txt'
        ];

        const OR = fields.map(f=> `${f} : (${ words.join(' AND ')})`);

        queryEntries.push(`(${OR.join(' OR ')})`);
    }      

    const query = queryEntries.join(' AND ');

    const response = await queryIndex(query, { l: this.pageSize });

    this.recordCount = response.numFound;
    this.records = response.docs;
}


//===========================================
//
//===========================================
async function created() {

    let facets        = getFacets();
    let aichiTargets  = getDomainTerms('AICHI-TARGETS');
    let cbdSubjects   = getDomainTerms('CBD-SUBJECTS');
    let resourceTypes = getDomainTerms('A762DF7E-B8D1-40D6-9DAC-D25E48C65528');
    
    facets        = await facets;
    aichiTargets  = await aichiTargets;
    cbdSubjects   = await cbdSubjects;
    resourceTypes = await resourceTypes;

    this.facets.aichiTargets  = facets.aichiTargets_ss;
    this.facets.cbdSubjects   = facets.cbdSubjects_ss;
    this.facets.resourceTypes = facets.resourceTypes_ss;
    
    this.lists.aichiTargets   = aichiTargets
    this.lists.cbdSubjects    = cbdSubjects
    this.lists.resourceTypes  = resourceTypes

    await this.search();
}

//===========================================
//
//===========================================
async function getDomainTerms(code) {
    return await api.get(`/api/v2013/thesaurus/domains/${encodeURIComponent(code)}/terms`).then(toData);
}

const baseIndexQuery = 'schema_s:resource AND realm_ss:(CHM BCH ABSCH)';

//===========================================
//
//===========================================
async function queryIndex(query, { sk, l} = {}) {

    const params = {
        q  : [baseIndexQuery, query].filter(o=>!!o).join(' AND '),
        start: sk,
        rows: l
    }

    const result = await api.get(`/api/v2013/index`, { params }).then(toData);

    return result?.response;
}

//===========================================
//
//===========================================
async function getFacets(query) {

    const params = {
        q    : [baseIndexQuery, query].filter(o=>!!o).join(' AND '),
        facet: 'true',
        'facet.field': ['cbdSubjects_ss','resourceTypes_ss','aichiTargets_ss'],
        rows : 0,
    }

    const result = await api.get(`/api/v2013/index`, { params }).then(toData);
    const rawfacets = result?.facet_counts?.facet_fields;
    const keyPairs = Object.entries(rawfacets);
    const facets = {};

    keyPairs.forEach(([key, value]) => {

        facets[key] = {};

        for(let i=0; i<value.length; i+=2) {
            const indentifier = value[i];
            const count       = value[i+1];
            facets[key][indentifier] = count;
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