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

                    <div class="row" v-if="filters" style="border-bottom:1px solid #eee; padding-bottom:10px">
                        <div class="col-md-12">
                            <span>
                                <span v-for="session in filters.sessions" :key="session">
                                    <span class="badge chip badge-primary">
                                        COP {{session|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('sessions', session);"></i>
                                    </span>
                                </span>

                                <span v-for="type in filters.types" :key="type">
                                    <span class="badge chip badge-primary">
                                        {{type|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('types', type);"></i>
                                    </span>
                                </span>

                                <span v-for="subject in filters.subjects" :key="subject">
                                    <span class="badge chip badge-primary">
                                        {{subject|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('subjects', subject);"></i>
                                    </span>
                                </span>

                                <span v-for="gbfGoal in filters.gbfGoals" :key="gbfGoal">
                                    <span class="badge chip badge-primary">
                                        {{gbfGoal|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('gbfGoals', gbfGoal);"></i>
                                    </span>
                                </span>

                                <span v-for="gbfTarget in filters.gbfTargets" :key="gbfTarget">
                                    <span class="badge chip badge-primary">
                                        {{gbfTarget|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('gbfTargets', gbfTarget);"></i>
                                    </span>
                                </span>

                                <span v-for="aichiTarget in filters.aichiTargets" :key="aichiTarget">
                                    <span class="badge chip badge-primary">
                                        {{aichiTarget|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('aichiTargets', aichiTarget);"></i>
                                    </span>
                                </span>

                                <span v-for="actor in filters.actors" :key="actor">
                                    <span class="badge chip badge-primary">
                                        {{termDescription('actors', actor)|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('actors', actor);"></i>
                                    </span>
                                </span>

                                <span v-for="status in filters.statuses" :key="status">
                                    <span class="badge chip badge-primary">
                                        {{capitalize(status)|lstring}}
                                        <i class="fa fa-minus-circle" @click="updateFilters('statuses', status);"></i>
                                    </span>
                                </span>

                            </span>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <label for="step2">Free text</label>
                            <input class="form-control" type="text" v-model="freeText" @keyup.enter="search" :class="{'warning-border': freeTextEmpty}">
                        </div>
                    </div>
                    <div v-if="freeTextEmpty" class="col-md-12 alert alert-warning">Please enter text to search.</div>
                    
                    <!-- Filters -->
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
                                                <select class="form-control" v-model="selectedSession" @change="updateFilters('sessions', filterName(selectedSession));">
                                                    <option value="">all meetings</option>
                                                    <optgroup v-for="(session, sessionName) in lists.sessions" :label="sessionName" :key="sessionName">
                                                    <option v-for="item in session" :value="item.title" :key="item.code">{{ item.title }}</option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label>Decision Type</label>
                                                <select class="form-control" v-model="selectedType" @change="updateFilters('types', filterName(selectedType));">
                                                    <option value="">all decision types</option>
                                                    <option v-for="item in lists.types" :value="item.title" :key="item.code">{{ item.title }}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <br />
                                        <div class="row">
                                            <div class="col-md-2">
                                                <label>Subjects</label>
                                                <select class="form-control" v-model="selectedSubject" @change="updateFilters('subjects', filterName(selectedSubject));">
                                                    <option value="">all subjects</option>
                                                    <optgroup v-for="group in lists.subjects" :key="group.name" :label="group.name">
                                                        <option v-for="subject in group.subjects" :key="subject.identifier" :value="subject">{{ subject.name }}</option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>GBF Goals</label>
                                                <select class="form-control" v-model="selectedGBFGoal" @change="updateFilters('gbfGoals', filterName(selectedGBFGoal));">
                                                    <option value="">all GBF goals</option>
                                                    <option v-for="item in lists.gbfGoals" :key="item.identifier" :value="item">{{ item.name }}</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>GBF Targets</label>
                                                <select class="form-control" v-model="selectedGBFTarget" @change="updateFilters('gbfTargets', filterName(selectedGBFTarget));">
                                                    <option value="">all GBF targets</option>
                                                    <option v-for="item in lists.gbfTargets" :key="item.identifier" :value="item">{{ item.name }}</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>Aichi Targets</label>
                                                <select class="form-control" v-model="selectedAichiTarget" @change="updateFilters('aichiTargets', filterName(selectedAichiTarget));">
                                                <option value="">all AICHI targets</option>
                                                    <option v-for="item in lists.aichiTargets" :key="item.identifier" :value="item">{{ item.name }}</option>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>Actors</label>
                                                <select class="form-control" v-model="selectedActor" @change="updateFilters('actors', filterName(selectedActor));">
                                                    <option value="">all actors</option>
                                                    <optgroup v-for="group in lists.actors" :key="group.identifier" :label="group.name">
                                                        <option v-for="actor in group.actors" :key="actor.identifier" :value="actor">{{ actor.name }}</option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div class="col-md-2">
                                                <label>Status</label>
                                                <select class="form-control" v-model="selectedStatus" @change="updateFilters('statuses', filterName(selectedStatus));">
                                                <option value="">all statuses</option>
                                                    <option v-for="item in lists.statuses" :key="item.code" :value="item">{{ item.title }}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filters -->
                    
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
                        <div class="col-md-8"></div>
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
                        <span v-for="item in record.dtt_type_REL_ss" :key="item">
                            <span v-if="item=='operational'" class="pull-right badge ng-scope badge-info" style="opacity:0.5; margin-right: 6px;">
                                <span><i class="fa fa-cog"></i> Operational</span>
                            </span>

                            <span v-if="item=='informational'" class="pull-right badge ng-scope badge-secondary" style="opacity:0.5; margin-right: 6px;">
                                <span><i class="fa fa-info-circle"></i> Informational</span>
                            </span>
                        </span>


                        <span 
                            v-for="item in records.dtt_status_ss" 
                            :key="item"
                            class="pull-right badge" 
                            :class="item === 'active' ? 'badge-success' : 'badge-secondary'"
                            style="opacity:0.5;margin-right:6px">
                            <i class="fa fa-info-circle"></i> 
                            <span>{{ capitalize(item) }}</span>
                        </span>

                        <ul>
                            <li v-for="item in record.dtt_gbfGoal_ii" :key="item">
                                <a href="https://www.cbd.int/gbf/goals/" target="_blank">
                                <img 
                                    :src="`/app/images/gbf-goals/gbf-${item}-64.png`"
									width="20" style="margin: 1px 1px 1px 1px;">
                                </a>
                            </li>
                            <li v-for="item in record.dtt_gbfTarget_ii" :key="item">
                                <a :href="`https://www.cbd.int/gbf/targets/${encodeURIComponent(parseInt(item))}`" target="_blank">
                                <img 
                                    :src="`/app/images/gbf-targets/gbf-${item}-64.png`" 
									width="20" style="margin: 1px 1px 1px 1px;">
                                </a>
                            </li>
                        </ul>

                        <i class="fa fa-search" aria-hidden="true"></i> Decision <a 
                            :href="`/decisions/${record.dtt_codeUrl_ii}`"
                            target="_blank">
                                {{ record.dtt_code_s }}
                        </a> - {{ record.title_s }}
                        <hr />
                    </div>
                    <!--
                    Debug:<br />
                    <pre>{{ lists }}</pre>
                    -->
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
import axios from 'axios';
import lstring from '~/filters/lstring.js';
import SolrApi from '../../api/solr.js';
import ThesaurusApi from '../../api/thesaurus.js';
import '~/filters/term.js';
import './view-element.js';
import '~/directives/aichi-targets/pagination.js';
import './directives/header-decisions.js';
import sessionsList from './data/sessions.js';
import typesList from './data/types.js';
import actorsList from './data/actors.js';
import statusesList from './data/statuses.js';
import DecisionSearchHelp from '~/components/decisions/decision-search-help.vue';

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
            selectedActor       : '',
            selectedAichiTarget : '',
            selectedGBFTarget   : '',
            selectedGBFGoal     : '',
            selectedSession     : '',
            selectedSubject     : '',
            selectedStatus      : '',
            selectedType        : '',
            lists: {
                actors          : [],
                aichiTargets    : [],
                gbfGoals        : [],
                gbfTargets      : [],
                sessions        : [],
                statuses        : [],
                subjects        : [],
                types           : []
            },
            filters: {
                actors          : [],
                aichiTargets    : [],
                gbfGoals        : [],
                gbfTargets      : [],
                sessions        : [],
                statuses        : [],
                subjects        : [],
                types           : []
            },
            records: null,
            recordsCount: null,
            recordsFound: false,
            pageSize: 10,
            freeText: '',
            freeTextEmpty: false
        }
    },
    created,
    methods:
    {
        search,
        capitalize,
        updateFilters,
        filterName,
        getQueryParts,
        termDescription
    }
}

// ====================================
// 
// ====================================

async function created() {
    let aichiTargetsList    = getDomainTerms('AICHI-TARGETS');
    let subjectList         = getDomainTerms('CBD-SUBJECTS');
    let gbfTargetsList      = getDomainTerms('GBF-TARGETS');
    let gbfGoalsList        = getDomainTerms('GBF-GOALS');

    aichiTargetsList        = await aichiTargetsList;
    subjectList             = await subjectList;
    gbfTargetsList          = await gbfTargetsList;
    gbfGoalsList            = await gbfGoalsList;

    this.lists.types        = _(typesList)          .reduce((r,v) => { r[v.code] = v; return r; }, {});
    this.lists.sessions     = _(sessionsList)       .reduce((r,v) => { if (!r[v.group]) { r[v.group] = []; } r[v.group].push(v); return r; }, {});
    this.lists.statuses     = _(statusesList)       .reduce((r,v) => { r[v.code] = v; return r; }, {});
    this.lists.gbfTargets   = _(gbfTargetsList)     .reduce((r,v) => { r[v.identifier] = v; return r; }, {});
    this.lists.gbfGoals     = _(gbfGoalsList)       .reduce((r,v) => { r[v.identifier] = v; return r; }, {});
    this.lists.aichiTargets = _(aichiTargetsList)   .reduce((r,v) => { r[v.identifier] = v; return r; }, {});
    this.lists.actors       = _(actorsList)         .reduce((groups, actors) => {
        const key = actors.group;

        const title = actorsList.find(item => item.group === key);

        if(!groups[key]) {
            groups[key] = {
                key: key,
                name: termName(title),
                actors: []
            };
        }

        groups[key].actors.push({
            identifier: actors.code,
            name: actors.title
        });
        return groups;
    }, {});

    this.lists.subjects     = _(subjectList)        .reduce((groups, subject) => {
        subject.broaderTerms.forEach(bt => {
            const key = bt.identifier;
            const title = subjectList.find(item => item.identifier === key);

            if (!groups[key]) {
                groups[key] = {
                    key: key,
                    name: termName(title),
                    subjects: []
                };
            }
            groups[key].subjects.push({
                termId: subject.termId,
                identifier: subject.identifier,
                name: subject.name,
                title: subject.title
            });
        });
        return groups;
    }, {});
    
}

async function search() {
    this.freeTextEmpty = _.isEmpty(this.freeText);
    
    if (!this.freeTextEmpty) {

        const words = `title_t:${this.freeText.toLowerCase().split(' ').filter(w=>!!w).map(w=> `${solr.escape(w)}~`)}`;
        const filter = getQueryParts(this.filters);
        const query = AND(words, filter.sessions, filter.types, filter.subjects, filter.gbfGoals, filter.gbfTargets, filter.aichiTargets, filter.actors, filter.statuses);
        
        const { response } = await queryIndex(query);

        this.recordsFound = (response.numFound !== '') ? true : false;
        this.recordsCount = response.numFound;

        this.records = response.docs.map(o=>{
            o.dtt_gbfTarget_ss  = o.dtt_gbfTarget_ss?.filter(o=>/^GBF-TARGET-/.test(o));
            o.dtt_gbfTarget_ii  = o.dtt_gbfTarget_ss?.map(o=>(o.replace(/^GBF-TARGET-/, '')));

            o.dtt_gbfGoal_ss    = o.dtt_gbfGoal_ss?.filter(o=>/^GBF-GOAL-/.test(o));
            o.dtt_gbfGoal_ii    = o.dtt_gbfGoal_ss?.map(o=>(o.replace(/^GBF-GOAL-/, '')).toLowerCase());

            o.dtt_codeUrl_ii    = (o.dtt_paragraphCode_s || o.dtt_code_s).replace(/^CBD\//, '').toLowerCase();
            return o;
        });
    }
}

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

function updateFilters(section, value) {
    if(value === '') {
        this.filters[section] = []; 
    } else {
        const index = this.filters[section].indexOf(value);
        if (index !== -1) {
            this.filters[section].splice(index, 1);
        } else {
            this.filters[section].push(value);
        }
    }
}

function getQueryParts(filters) {

    let sessions        = null;
    let types           = null;
    let subjects        = null;
    let gbfGoals        = null;
    let gbfTargets      = null;
    let aichiTargets    = null;
    let actors          = null;
    let statuses        = null;

    if(!_.isEmpty(filters.sessions))        sessions        = `dtt_code_s:(${filters.sessions.map(o => `CBD/COP/${o.padStart(2,0)}/*`).join(' OR ')})`; // find solution because solr.escape is including \ before *
    if(!_.isEmpty(filters.types))           types           = `dtt_type_REL_ss:(${filters.types.map(o => o.toLowerCase()).map(s=> solr.escape(s)).join(' OR ')})`;
    if(!_.isEmpty(filters.subjects))        subjects        = `dtt_subject_REL_ss:(${filters.subjects.map(s=> s.toUpperCase()).join(' OR ')})`; // find solution because solr.escape is including \ before -
    if(!_.isEmpty(filters.gbfGoals))        gbfGoals        = `dtt_gbfGoal_ss:(${filters.gbfGoals.map(s=> s.toUpperCase()).join(' OR ')})`; // find solution because solr.escape is including \ before -
    if(!_.isEmpty(filters.gbfTargets))      gbfTargets      = `dtt_gbfTarget_ss:(${filters.gbfTargets.map(s=> s.toUpperCase()).join(' OR ')})`; // find solution because solr.escape is including \ before -
    if(!_.isEmpty(filters.aichiTargets))    aichiTargets    = `dtt_aichiTarget_ss:(${filters.aichiTargets.map(s=> s.toUpperCase()).join(' OR ')})`; // find solution because solr.escape is including \ before -
    if(!_.isEmpty(filters.actors))          actors          = `dtt_actor_REL_ss:(${filters.actors.map(s=> s.toLowerCase()).join(' OR ')})`; // find solution because solr.escape is including \ before -
    if(!_.isEmpty(filters.statuses))        statuses        = `dtt_status_REL_ss:(${filters.statuses.map(s=> s).join(' OR ')})`; // find solution because solr.escape is including \ before -

    return { sessions, types, subjects, gbfGoals, gbfTargets, aichiTargets, actors, statuses }
}

function AND(...parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' AND ' )})` : null; }
function OR (...parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' OR '  )})` : null; }

function targetCodeToNumber(code) {
    return parseInt(code.replace(/.*?(\d+)$/, '$1'));
}

function termDescription(section, term) {
    let result = null;
    if(section == 'actors') result = actorsList.find(item => item.code === term)
    return result.title;
}

function termName(term) {
    return term.shortTitle?.en || term.title?.en || term.name || term.identifier || term.group;
}

function filterName(term) {
    return term.identifier || term.code || term;
}

function capitalize(text) {
    const lowerText = this.$options.filters.lowercase(text);
    var capitalized = []
    lowerText.split(' ').forEach(word => {
        capitalized.push(
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
    })
    return capitalized.join(' ')
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

.warning-border {
    border: 2px solid red;
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
