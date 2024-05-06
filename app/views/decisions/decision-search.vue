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

                    <div class="row" v-if="selectedFilter" style="border-bottom:1px solid #eee; padding-bottom:10px">
                        <span v-for="(filters, key) in selectedFilter" :key="key">
                            <span v-for="value in filters" :key="value.id">
                                <i 
                                    v-if="!['freeText', 'session'].includes(key)"
                                    class="fa fa-exclamation-circle"
                                    :class="{'text-warning': value.notInclude}"
                                    @click="toggleNotInclude(value, key)">
                                </i>
                                <span 
                                class="badge chip"
                                :class="{ 'badge-primary': !value.notInclude, 'badge-danger': value.notInclude }"
                                >{{ value.title | lstring }}
                                <i class="fa fa-minus-circle" @click="removeFilter(value, key)"></i>
                                </span>
                            </span>
                        </span>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <label for="step2">Free text</label>
                            <input 
                                class="form-control" 
                                id="step2"
                                v-model="freeText"
                                @input="handleInput"
                                @blur="handleBlur"
                            >
                        </div>
                    </div>

                    <div class="row" style="margin-top: 10px">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header" style="background-color: transparent">
                                    <a data-toggle="collapse" href="#advanceSearch" id="step3" aria-expanded="false" aria-controls="advanceSearch">Advanced Search</a>
                                </div>
                                <div id="advanceSearch" class="collapse">
                                    <div class="card-body">
                                        <div class="row">

                                            <div class="col-md-6">
                                                <label>Meeting</label>

                                                <select class="form-control" v-model="selectedSession" @change="search(selectedSession, 'session'); selectedSession=''">
                                                    <option value="">all meetings</option>
                                                    <optgroup v-for="(session, groups) in sessions" :key="groups" :label="groups">
                                                        <option v-for="item in session" :key="item.code" :value="item.code">
                                                        {{ item.title | lstring }}
                                                        </option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label>Decision Type</label>
                                                <select class="form-control" v-model="selectedType" @change="search(selectedType, 'type'); selectedType=''">
                                                    <option value="">all decision types</option>
                                                    <option v-for="item in types" :key="item.code" :value="item.code">
                                                    {{ item.title | lstring }}
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <br />
                                        <div class="row">
                                            <div class="col-md-2">
                                                <label>Subjects</label>
                                                <select class="form-control" v-model="selectedSubject" @change="search(selectedSubject, 'subjects'); selectedType=''">
                                                <optgroup v-for="group in lists.subjects" :key="group.name" :label="group.name">
                                                    <option v-for="subject in group.subjects" :key="subject.identifier" :value="subject.identifier">
                                                    {{ subject.title | localize }}
                                                    </option>
                                                </optgroup>
                                                <option value="">all subjects</option>
                                                </select>
                                                {{ lists }}
                                            </div>
                                            <div class="col-md-2">
                                                <label>GBF Goals</label>
                                                <select class="form-control"  ng-model="selectedTarget" ng-options="target.identifier as (target.shortTitle|lstring) group by collections.gbfGoals[target.broaderTerms[0]].name for target in collections.gbfGoalsMap|filter:noNarrower"
                                                    ng-change="search(selectedTarget, 'gbfGoals'); selectedTarget=''">
                                                    <option value="">all GBF goals</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>GBF Targets</label>
                                                <select class="form-control"  ng-model="selectedTarget" ng-options="target.identifier as (target.shortTitle|lstring) group by collections.gbfTargets[target.broaderTerms[0]].name for target in collections.gbfTargetsMap|filter:noNarrower"
                                                    ng-change="search(selectedTarget, 'gbfTargets'); selectedTarget=''">
                                                    <option value="">all GBF targets</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>Aichi Targets</label>
                                                <select class="form-control"  ng-model="selectedTarget" ng-options="target.identifier as (target.title|lstring) group by collections.aichiTargets[target.broaderTerms[0]].name for target in collections.aichiTargetsMap|filter:noNarrower"
                                                    ng-change="search(selectedTarget, 'aichiTargets'); selectedTarget=''">
                                                    <option value="">all AICHI targets</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>Actors</label>
                                                <select class="form-control" v-model="selectedActor" @change="search(selectedActor, 'actor'); selectedActor=''">
                                                    <option value="">all actors</option>
                                                    <optgroup v-for="(actor, groups) in actors" :key="groups" :label="groups">
                                                        <option v-for="item in actor" :key="item.code" :value="item.code">
                                                        {{ item.title | lstring }}
                                                        </option>
                                                    </optgroup>
                                                </select>
                                                <br />
                                            </div>
                                            <div class="col-md-2">
                                                <label>Status</label>
                                                <select class="form-control" v-model="selectedStatus" @change="search(selectedStatus, 'session'); selectedStatus=''">
                                                    <option value="">all statuses</option>
                                                    <option v-for="item in statuses" :key="item.code" :value="item.code">
                                                    {{ item.title | lstring }}
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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

    <div class="row" id="searchResult">
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
                                    <select ng-model="itemsPerPage" ng-change="currentPage=0;search(undefined, undefined, undefined,searchCount);updateQueryString();">
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
                                    <select ng-model="pageSort" ng-change="currentPage=0;search();updateQueryString();">
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
            </div>
        </div>
        <br />
        <div class="card-body view-decision" id="searchResultSection">
            <div>
                <pagination
                    pages="pages"
                    current-page="currentPage"
                    items-per-page="itemsPerPage"
                    filtered="searchResult"
                    on-page="onPage(pageIndex)"
                    count="searchCount"
                    pagination-size="6"
                >
                </pagination>
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
import actorsList from './data/actors.js'
import statuses from './data/statuses.js'
import sessionsList from './data/sessions.js'
import typesList from './data/types.js'
import { sanitizeHtml } from '~/services/html';
import DecisionSearchHelp from '~/components/decisions/decision-search-help.vue'


// ====================================
// Update this when deploying to 
// production.
// ====================================

const solr = new SolrApi({prefixUrl:'https://api.cbddev.xyz/'});
const thesaurus = new ThesaurusApi({prefixUrl:'https://api.cbddev.xyz/'});

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
            selectedFilter: {
                session         : [],
                elementType     : [],
                subjects        : [],
                aichiTargets    : [],
                gbfTargets      : [],
                gbfGoals        : [],
                actors          : [],
                statuses        : [],
                freeText        : []
            },
            lists: {
                subjects        : [],
                aichiTargets    : [],
                gbfTargets      : [],
                gbfGoals        : [],
                actors          : [],
                statuses        : []
            }
        }
    },
    computed: {
        types() { return typesList },
        sessions() { 
            const groups = sessionsList.reduce((accumulator, actor) => {
                const group = actor.group || '';
                if (!accumulator[group]) {
                    accumulator[group] = [];
                }
                accumulator[group].push(actor);
                return accumulator;
            }, {});
        
            return groups;
        },
		actors() { 
            const groups = actorsList.reduce((accumulator, actor) => {
                const group = actor.group || '';
                if (!accumulator[group]) {
                    accumulator[group] = [];
                }
                accumulator[group].push(actor);
                return accumulator;
            }, {});
        
            for (const group in groups) {
                groups[group].sort((a, b) => a.title.localeCompare(b.title));
            }

            return groups;
        },
        statuses() { return statuses},
		aichiTargets() { return aichiTargets},
		gbfTargets() { return gbfTargets},
		gbfGoals() { return gbfGoals}
    },
    created
}

// ====================================
// 
// ====================================

async function search() {


}

async function created() {

    let subjects        = getDomainTerms('CBD-SUBJECTS');
    subjects            = await subjects;

    this.lists.subjects = subjects.map((t=>({ ...t, name: termName(t), target : targetCodeToNumber(t.identifier) })));
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
</style>
