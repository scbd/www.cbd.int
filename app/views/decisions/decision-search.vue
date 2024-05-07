<template>
<div class="decision-tracking">
    <header-decisions>
        <span class="float-right">
            <decision-search-help ng-vue="vueOptions" title="Help" />
        </span>
        <h1><span id="step1">Search Decisions</span></h1>
    </header-decisions>

    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    Filters
                </div>
                <div class="card-body">

                    <div class="row">
                        <div class="col-md-12">
                            <label for="step2">Free text</label>
                            <input class="form-control" type="text" v-model="freeText" @keyup.enter="search">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <br/>
                            <button class="btn btn-primary  float-right" @click="search()">Search</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br />

    <div class="row" id="searchResult" v-if="recordsFound && recordsFound==true">
            <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <div class="row">
                        <div class="col-md-4">

                            <span class="float-left">
                                <i class="fa fa-clone" ng-class="icon"></i> Search results
                            </span>
                        </div>
                        <div class="col-md-8">
                            <span class="float-right">
                                <div class="float-left">
                                    Items per page:
                                    <select ng-model="itemsPerPage">
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="200">200</option>
                                        <option value="300">300</option>
                                    </select>
                                </div>
                                <div class="float-right" style="padding-left: 10px;">
                                    Sort by:
                                    <select ng-model="pageSort">
                                        <option value="">Relevance</option>
                                        <option value="session">Session</option>
                                        <option value="statuses">Status</option>
                                        <option value="types">Type</option>
                                    </select>
                                </div>
                            </span>
                        </div>
                    </div>
                </div>
                <!-- Result -->
                <div v-if="records && recordsCount==0"  style="position: sticky; top:0px">
                    <div class="card-body">No results found.</div>
                </div>

                <div v-if="records && recordsCount>=1"  style="position: sticky; top:0px">
                    <div class="card-body">
                        <b>{{ recordsCount }}</b> records found.
                    </div>
                    <div class="card-body" v-for="record in records" :key="record.id">
                        <ul>
                            <li v-for="item in record.dtt_gbfGoal_ss" :key="item">
                                <img 
                                    :src="`/app/images/gbf-goals/gbf-${item.replace('GBF-GOAL-','').toLowerCase()}-64.png`"
									width="20" style="margin: 1px 1px 1px 1px;">
                            </li>
                            <li v-for="item in record.dtt_gbfTarget_ss" :key="item">
                                <img 
                                    :src="`/app/images/gbf-targets/gbf-${item.replace('GBF-TARGET-','')}-64.png`" 
									width="20" style="margin: 1px 1px 1px 1px;">
                            </li>
                        </ul>
                        {{ record.dtt_code_s }} : {{ record.dtt_paragraphCode_s }} - {{ record.title_s }}<br />
                    </div>
                    <pre>{{ record }}</pre>
                
                </div>

            </div>
        </div>
        <br />

        <div class="card-body view-decision" id="searchResultSection">
            <div>
                <!-- Pagination -->
            </div>
        </div>
    </div>
    <br /><br />

</div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios'
import lstring from '~/filters/lstring.js';
import SolrApi from '../../api/solr.js';
import ThesaurusApi from '../../api/thesaurus.js';
import '~/filters/term.js'
import './view-element.js'
import '~/directives/aichi-targets/pagination.js'
import './directives/header-decisions.js'
import { sanitizeHtml } from '~/services/html';
import DecisionSearchHelp from '~/components/decisions/decision-search-help.vue'


// ====================================
// Update this when deploying to 
// production.
// ====================================

const solr = new SolrApi({prefixUrl:'https://api.cbddev.xyz/'});
const thesaurus = new ThesaurusApi({prefixUrl:'https://api.cbddev.xyz/'});

const baseIndexQuery = 'schema_s:decision-text';

export default {
    name: 'decisionSearch',
    filters: {
        lstring,
        uppercase(text) {
            return (text??'').toString().toUpperCase();
        },
        lowercase(text) {
            return (text??'').toString().toLowerCase()
        }
    },
    data() {
        return {
            lists: {
                actors          : [],
                aichiTargets    : [],
                gbfGoals        : [],
                gbfTargets      : [],
                statuses        : [],
                subjects        : []
            },
            records: null,
            record: null,
            recordsCount: null,
            recordsFound: false,
            pageSize: 10,
            freeText: '',
        }
    },
    methods:
    {
        async search() {
            if (this.freeText.trim() !== '') {
                const query = `title_t:*${this.freeText.toLowerCase().replace(/^\*+|\*+$/g, '')}*`;
                const { response } = await queryIndex(query);

                this.recordsFound = (response.numFound !== '') ? true : false;
                this.recordsCount = response.numFound;
                this.records = response.docs;

                this.record = response.docs.map(o=>{
                    o.dtt_gbfTarget_ss = o.dtt_gbfTarget_ss?.filter(o=>/^GBF-TARGET-/.test(o));
                    o.dtt_gbfTarget_ii = o.dtt_gbfTarget_ss?.map(o=>(o.replace(/^GBF-TARGET-/, '')));
                    return o;
                });
            }
        }
    }
}

// ====================================
// 
// ====================================

async function queryIndex(query, { sk: start, l: rows } = {}) {
    query = AND(baseIndexQuery, query);
    const result = await solr.query(query, {start , rows});
    return result;
}

async function getDomainTerms(code) {
    let terms = await thesaurus.getDomainTerms(code);

    terms.forEach((term) => {
        term.broaderTerms  = term.broaderTerms.map(id => ({ identifier: id }));
        term.narrowerTerms = term.narrowerTerms.map(id => ({ identifier: id }));
    });

    return terms;
}

function AND(...parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' AND ' )})` : null; }
function OR (...parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' OR '  )})` : null; }

function targetCodeToNumber(code) {
    return parseInt(code.replace(/.*?(\d+)$/, '$1'));
}

function termName(term) {
    return term.shortTitle.en || term.title?.en || term.name || term.identifier;
}
</script>

<style scoped>
@import url(./view.css);
.chip {
    display: inline-block;
    padding: 5px;
    font-size: 12px;
    border-radius: 3px;
    margin: 2px;
    cursor: pointer;
}
.chip-sm {
    display: inline-block;
    border-radius: 3px;
    margin: 2px;
}
.decision-box, .view-decision element.box {
    border-bottom: none!important;
    border-radius: 0!important;    
    margin-bottom: 0px;
}
.view-decision element:last-child{
    margin-bottom: 0px;
}
.tags{
    background:#eee;
    margin-left:8px;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 0px 0px 4px 4px;
    padding-left:5px;
}
.para-tags{
    width:98.8%;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

li {
  float: left;
}
</style>
