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
                                <input class="form-control" type="text" v-model.lazy="freeText" @change="search({page:0})"
                                    :class="{'warning-border': freeTextEmpty}">
                            </div>
                        </div>
                        <div v-if="freeTextEmpty" class="col-md-12 alert alert-warning">Please enter text to search.
                        </div>

                        <!-- Filters -->
                        <div class="row" style="margin-top: 10px">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-header" style="background-color: transparent">
                                        <a data-toggle="collapse" href="#advanceSearch" id="step3" aria-expanded="false"
                                            aria-controls="advanceSearch">Advanced Search</a>
                                    </div>
                                    <div id="advanceSearch" class="collapse">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <label>Meeting</label>
                                                    <select class="form-control" v-model="selectedSession"
                                                        @change="addFilters('sessions', selectedSession); selectedSession=''; search({page:0})">
                                                        <option value="">Select...</option>
                                                        <option v-if="filters.sessions.length" value="{CLEAR}">any meetings</option>
                                                        <optgroup v-for="(session, sessionName) in lists.sessions"
                                                            :label="sessionName" :key="sessionName">
                                                            <option v-for="item in session" :value="item.code"
                                                                :key="item.code">{{ item.title }}</option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                <div class="col-md-6">
                                                    <label>Decision Type</label>
                                                    <select class="form-control" v-model="selectedType"
                                                        @change="addFilters('types', selectedType); selectedType=''; search({page:0})">
                                                        <option value="">Select...</option>
                                                        <option v-if="filters.types.length" value="{CLEAR}">any decision types</option>
                                                        <option v-for="item in lists.types" :value="item.code"
                                                            :key="item.code">{{ item.title }}</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <br />
                                            <div class="row">
                                                <div class="col-md-2">
                                                    <label>Subjects</label>
                                                    <select class="form-control" v-model="selectedSubject"
                                                        @change="addFilters('subjects', selectedSubject); selectedSubject=''; search({page:0})">
                                                        <option value="">Select...</option>
                                                        <option v-if="filters.subjects.length" value="{CLEAR}">any subjects</option>
                                                        <optgroup v-for="group in lists.subjects" :key="group.name"
                                                            :label="group.name">
                                                            <option v-for="subject in group.subjects"
                                                                :key="subject.identifier" :value="subject.identifier">{{
                                                                subject.name }}</option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <label>GBF Goals</label>
                                                    <select class="form-control" v-model="selectedGBFGoal"
                                                        @change="addFilters('gbfGoals', selectedGBFGoal); selectedGBFGoal=''; search({page:0})">
                                                        <option value="">Select...</option>
                                                        <option v-if="filters.gbfGoals.length" value="{CLEAR}">any goals</option>
                                                        <option v-for="item in lists.gbfGoals" :key="item.identifier"
                                                            :value="item.identifier">{{ item.name }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <label>GBF Targets</label>
                                                    <select class="form-control" v-model="selectedGBFTarget"
                                                        @change="addFilters('gbfTargets', selectedGBFTarget); selectedGBFTarget=''; search({page:0})">
                                                        <option value="">Select...</option>
                                                        <option v-if="filters.gbfTargets.length" value="{CLEAR}">any GBF targets</option>
                                                        <option v-for="item in lists.gbfTargets" :key="item.identifier"
                                                            :value="item.identifier">{{ item.name }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <label>Aichi Targets</label>
                                                    <select class="form-control" v-model="selectedAichiTarget"
                                                        @change="addFilters('aichiTargets', selectedAichiTarget); selectedAichiTarget=''; search({page:0})">
                                                        <option value="">Select.....</option>
                                                        <option v-if="filters.aichiTargets.length" value="{CLEAR}">any AICHI targets</option>
                                                        <option v-for="item in lists.aichiTargets"
                                                            :key="item.identifier" :value="item.identifier">{{ item.name
                                                            }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <label>Actors</label>
                                                    <select class="form-control" v-model="selectedActor"
                                                        @change="addFilters('actors', selectedActor); selectedActor=''; search({page:0})">
                                                        <option value="">Select...</option>
                                                        <option v-if="filters.actors.length" value="{CLEAR}">any actors</option>
                                                        <optgroup v-for="group in lists.actors" :key="group.identifier"
                                                            :label="group.name">
                                                            <option v-for="actor in group.actors"
                                                                :key="actor.identifier" :value="actor.identifier">{{
                                                                actor.name }}</option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <label>Status</label>
                                                    <select class="form-control" v-model="selectedStatus"
                                                        @change="addFilters('statuses', selectedStatus); selectedStatus = ''; search({ page: 0 })">
                                                        <option value="">Select...</option>
                                                        <option v-if="filters.statuses.length" value="{CLEAR}">any statuses</option>
                                                        <option v-for="item in lists.statuses" :key="item.code"
                                                            :value="item.code">{{ item.title }}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Filters -->

                        <div class="row pt-2">

                            <div class="col-md-11 pt-2">

                                <span v-if="words.length">
                                    <span class="badge chip badge-primary">
                                        {{words.join(' ')}}
                                        <i class="fa fa-minus-circle"
                                            @click="freeText = ''; search({page: 0})"></i>
                                    </span>
                                </span>

                                <span v-for="session in filters.sessions" :key="session">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(sessionsList, session) | lstring }}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('sessions', session); search({ page: 0 })"></i>
                                    </span>
                                </span>

                                <span v-for="type in filters.types" :key="type">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(typesList, type) | lstring }}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('types', type); search({ page: 0 })"></i>
                                    </span>
                                </span>

                                <span v-for="subject in filters.subjects" :key="subject">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(subjectList, subject) | lstring }}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('subjects', subject); search({ page: 0 })"></i>
                                    </span>
                                </span>

                                <span v-for="gbfGoal in filters.gbfGoals" :key="gbfGoal">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(gbfGoalsList, gbfGoal) | lstring }}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('gbfGoals', gbfGoal); search({ page: 0 })"></i>
                                    </span>
                                </span>

                                <span v-for="gbfTarget in filters.gbfTargets" :key="gbfTarget">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(gbfTargetsList, gbfTarget) | lstring }}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('gbfTargets', gbfTarget); search({ page: 0 })"></i>
                                    </span>
                                </span>

                                <span v-for="aichiTarget in filters.aichiTargets" :key="aichiTarget">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(aichiTargetsList, aichiTarget) | lstring }}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('aichiTargets', aichiTarget); search({ page: 0 })"></i>
                                    </span>
                                </span>

                                <span v-for="actor in filters.actors" :key="actor">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(actorsList, actor) | lstring }}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('actors', actor); search({page:0})"></i>
                                    </span>
                                </span>

                                <span v-for="status in filters.statuses" :key="status">
                                    <span class="badge chip badge-primary">
                                        {{ getTitle(statusesList, status) | lstring}}
                                        <i class="fa fa-minus-circle"
                                            @click="removeFilters('statuses', status); search({page:0})"></i>
                                    </span>
                                </span>
                            </div>

                            <div class="col-md-1">
                                <button class="btn btn-primary  float-right" @click="search({page: 0})">Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br />

        <div class="row" id="searchResult" v-if="records">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-md-12">
                                <i class="fa fa-clone" ng-class="icon"></i> Search results
                            </div>
                        </div>
                    </div>
                    <!-- Result -->
                    <div v-if="recordsCount==0" style="position: sticky; top:0px">
                        <div class="card-body">No results found.</div>
                    </div>

                    <div v-if="recordsCount>=1" style="position: sticky; top:0px">
                        <div class="card-body">
                            <b>{{ recordsCount }}</b> records found.
                        </div>
                        <div class="card-body" v-for="record in records" :key="record.id">
                            <span v-for="item in record.dttType_REL_ss" :key="item">
                                <span v-if="item=='operational'" class="pull-right badge ng-scope badge-info"
                                    style="opacity:0.5; margin-right: 6px;">
                                    <span><i class="fa fa-cog"></i> Operational</span>
                                </span>

                                <span v-if="item=='informational'" class="pull-right badge ng-scope badge-secondary"
                                    style="opacity:0.5; margin-right: 6px;">
                                    <span><i class="fa fa-info-circle"></i> Informational</span>
                                </span>
                            </span>


                            <span v-for="item in records.dttStatus_ss" :key="item" class="pull-right badge"
                                :class="item === 'active' ? 'badge-success' : 'badge-secondary'"
                                style="opacity:0.5;margin-right:6px">
                                <i class="fa fa-info-circle"></i>
                                <span>{{ getTitle(statusesList, item) }}</span>
                            </span>

                            <ul>
                                <li v-for="item in record.dttGbfGoal_ii" :key="item">
                                    <a href="https://www.cbd.int/gbf/goals/" target="_blank">
                                        <img :src="`/app/images/gbf-goals/gbf-${item}-64.png`" width="20"
                                            style="margin: 1px 1px 1px 1px;">
                                    </a>
                                </li>
                                <li v-for="item in record.dttGbfTarget_ii" :key="item">
                                    <a :href="`https://www.cbd.int/gbf/targets/${encodeURIComponent(parseInt(item))}`"
                                        target="_blank">
                                        <img :src="`/app/images/gbf-targets/gbf-${item}-64.png`" width="20"
                                            style="margin: 1px 1px 1px 1px;">
                                    </a>
                                </li>
                            </ul>

                            <i class="fa fa-search" aria-hidden="true"></i> Decision <a
                                :href="`/decisions/${record.dttCodeUrl_ii}`" target="_blank">
                                {{ record.dttCode_s }}
                            </a> - {{ record.title_s }}
                            <hr />
                        </div>
                    </div>

                </div>
            </div>

            <div v-if="totalPages" class="card-body view-decision col-md-12" id="searchResultSection">
                <div>
                    <!-- Pagination -->
                    <div class="pagination">
                        <button :disabled="currentPage < 1" @click="previousPage()">Previous</button>
                        <span>Page {{ currentPage+1 }} of {{ totalPages }}</span>
                        <button :disabled="currentPage >= totalPages-1" @click="nextPage()">Next</button>
                    </div>
                </div>
            </div>
        </div>
        <br /><br />

    </div>
</template>

<script>
import _ from 'lodash';
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
    computed: {
        words() { return this.freeText.split(' ').filter(w=>!!w) },
        freeTextEmpty() {
            const hasFilters = _(Object.values(this.filters)).flatten().compact().size()>0
            return this.searched && !hasFilters && !this.words.length;
        },
        queryParts
    },
    data() {
        return {
            searched : false,
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
                types           : [],
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
            freeText: '',
            pageSize: 10,
            currentPage: 0,
            totalPages: 0
        }
    },
    created,
    methods:
    {
        search,
        previousPage,
        nextPage,
        addFilters,
        removeFilters,
        getTitle
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

    aichiTargetsList  = await aichiTargetsList;
    subjectList       = await subjectList;
    gbfTargetsList    = await gbfTargetsList;
    gbfGoalsList      = await gbfGoalsList;

    this.aichiTargetsList = aichiTargetsList;
    this.subjectList      = subjectList;
    this.gbfTargetsList   = gbfTargetsList;
    this.gbfGoalsList     = gbfGoalsList;
    this.typesList        = typesList;
    this.sessionsList     = sessionsList;
    this.statusesList     = statusesList;
    this.actorsList       = actorsList;


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

function getTitle(list, code) {
    return list.find(o=>o.identifier==code || o.code == code)?.title || code;
}

async function search({page}={}) {

    this.searched = true;
    if(page!==undefined) this.currentPage = page;

    const { queryParts, currentPage, pageSize } = this;

    if(!queryParts.length) { 
        this.records = null;
        this.recordsCount = null;
        this.totalPages = 0;
        return;
    }

    const query = AND(queryParts);
    
    const start = currentPage * pageSize;
    
    const { response } = await queryIndex(query, { sk: start, l: pageSize });

    this.recordsFound = (response.numFound !== '') ? true : false;
    this.recordsCount = response.numFound;
    this.totalPages = Math.ceil(response.numFound / this.pageSize);

    this.records = response.docs.map(o=>{
        o.dttGbfTarget_ss  = o.dttGbfTarget_ss?.filter(o=>/^GBF-TARGET-/.test(o));
        o.dttGbfTarget_ii  = o.dttGbfTarget_ss?.map(o=>(o.replace(/^GBF-TARGET-/, '')));

        o.dttGbfGoal_ss    = o.dttGbfGoal_ss?.filter(o=>/^GBF-GOAL-/.test(o));
        o.dttGbfGoal_ii    = o.dttGbfGoal_ss?.map(o=>(o.replace(/^GBF-GOAL-/, '')).toLowerCase());

        o.dttCodeUrl_ii    = (o.dttParagraphCode_s || o.dttCode_s).replace(/^CBD\//, '').toLowerCase();
        return o;
    });
}


async function queryIndex(query, { sk: start = 0, l: rows = 10 } = {}) {
    query = AND([baseIndexQuery, query]);
    const result = await solr.query(query, { start, rows });
    return result;
}

function previousPage() {
    if (this.currentPage > 0) 
        this.search({ page: this.currentPage-1 });
}

function nextPage() {
    if (this.currentPage < this.totalPages-1)
        this.search({ page: this.currentPage+1 });
}

async function getDomainTerms(code) {
    let terms = await thesaurus.getDomainTerms(code);

    terms.forEach((term) => {
        term.broaderTerms  = term.broaderTerms.map(id => ({ identifier: id }));
        term.narrowerTerms = term.narrowerTerms.map(id => ({ identifier: id }));
    });

    return terms;
}

function addFilters(section, value) {

    if(value=='{CLEAR}') {
        this.filters[section] = [];
        return;
    }

    this.filters[section] = _(this.filters[section]).union([value]).compact().value();
}

function removeFilters(section, value) {
    this.filters[section] = _(this.filters[section]).without(value).compact().value();
}

function queryParts() {

    const { filters, words } = this;

    let freetext        = null;
    let sessions        = null;
    let types           = null;
    let subjects        = null;
    let gbfGoals        = null;
    let gbfTargets      = null;
    let aichiTargets    = null;
    let actors          = null;
    let statuses        = null;

    if(!_.isEmpty(words))                freetext     = 'title_t:'           + AND(words.map(w=>`${solr.escape(w)}~`));
    if(!_.isEmpty(filters.sessions))     sessions     = `dttCode_s: (${filters.sessions    .map(o => `CBD/${padInt(o).replace(/-/g, '\/')}/`).map(solr.escape).map(o=>o+'*')})`;
    if(!_.isEmpty(filters.types))        types        = 'dttType_REL_ss:'    + OR(filters.types       .map(solr.escape));
    if(!_.isEmpty(filters.subjects))     subjects     = 'dttSubject_REL_ss:' + OR(filters.subjects    .map(solr.escape));
    if(!_.isEmpty(filters.gbfGoals))     gbfGoals     = 'dttGbfGoal_ss:'     + OR(filters.gbfGoals    .map(solr.escape));
    if(!_.isEmpty(filters.gbfTargets))   gbfTargets   = 'dttGbfTarget_ss:'   + OR(filters.gbfTargets  .map(solr.escape));
    if(!_.isEmpty(filters.aichiTargets)) aichiTargets = 'dttAichiTarget_ss:' + OR(filters.aichiTargets.map(solr.escape));
    if(!_.isEmpty(filters.actors))       actors       = 'dttActor_REL_ss:'   + OR(filters.actors      .map(solr.escape));
    if(!_.isEmpty(filters.statuses))     statuses     = 'dttStatus_REL_ss:'  + OR(filters.statuses    .map(solr.escape));

    return _.compact([freetext, sessions, types, subjects, gbfGoals, gbfTargets, aichiTargets, actors, statuses])
}

function AND(parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' AND ' )})` : null; }
function OR (parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' OR '  )})` : null; }

function targetCodeToNumber(code) {
    return parseInt(code.replace(/.*?(\d+)$/, '$1'));
}

function padInt(c) {
    return c && `${c}`.replace(/\d+/g, d=>d.padStart(2,0));
}

function termName(term) {
    return term.shortTitle?.en || term.title?.en || term.name || term.identifier || term.group;
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

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    margin-top: 20px;
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
    border-bottom: 1px solid #dee2e6;
}

.pagination button {
    padding: 5px 15px;
    margin: 0 10px;
    font-size: 16px;
    color: #495057;
    background-color: #ffffff;
    border: 1px solid #ced4da;
    cursor: pointer;
}

.pagination button:hover:not(:disabled) {
    background-color: #007bff;
    color: #ffffff;
}

.pagination button:disabled {
    color: #6c757d;
    cursor: not-allowed;
    background-color: #e9ecef;
    border-color: #dee2e6;
}

.pagination span {
    font-size: 16px;
    color: #495057;
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
