<template>
    <div class="container decisions-dashboard">

        <div class="row">
            <div class="col-md-8">
                <h1>COP Decisions</h1>
            </div>
            <div class="col-md-4">
                <label for="cop-selector" class="sr-only">Conference of the Parties</label>
                <select id="cop-selector" class="form-control" v-model="selectedSession" @change="onSessionChange()">
                    <option value="">All COPs</option>
                    <option v-for="session in sessions" :key="session.code" :value="session.code">{{session.title}}</option>
                </select>
            </div>
        </div>

        <div class="alert alert-danger" v-if="error">{{error}}</div>

        <div class="row">
            <div class="col-md-4">
                <h5>Paragraphs by type</h5>
                <div id="dashboard-type-chart" class="chart chart-sm"></div>
            </div>
            <div class="col-md-8">
                <h5>Top subjects</h5>
                <div id="dashboard-subject-chart" class="chart chart-tall"></div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <h5>Paragraphs per COP <small class="text-muted">(all COPs — not affected by the filters)</small></h5>
                <div id="dashboard-trend-chart" class="chart chart-lg"></div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <h5>
                    Decisions
                    <small class="text-muted" v-if="recordsCount!==null">{{recordsCount}} found</small>
                </h5>

                <div class="filter-chips" v-if="typeFilter || subjectFilter">
                    <span class="badge badge-secondary chip" v-if="typeFilter" @click="toggleType(typeFilter)">
                        {{typeTitle(typeFilter)}} <i class="fa fa-times"></i>
                    </span>
                    <span class="badge badge-secondary chip" v-if="subjectFilter" @click="toggleSubject(subjectFilter)">
                        {{subjectLabel(subjectFilter)}} <i class="fa fa-times"></i>
                    </span>
                </div>

                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Symbol</th>
                            <th scope="col">Title</th>
                            <th scope="col">COP</th>
                            <th scope="col" class="text-right">Paragraphs</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="record in records" :key="record.code">
                            <td nowrap>
                                <a :href="`/decisions/${record.url}`" target="_blank" rel="noopener noreferrer">
                                    <strong>{{record.symbol || record.code}}</strong>
                                </a>
                            </td>
                            <td>{{record.title}}</td>
                            <td nowrap>COP {{record.session}}</td>
                            <td class="text-right">{{record.paragraphs}}</td>
                        </tr>
                        <tr v-if="records && !records.length">
                            <td colspan="4" class="text-muted">No decisions match the current selection.</td>
                        </tr>
                    </tbody>
                </table>

                <div class="pagination" v-if="totalPages>1">
                    <button class="btn btn-sm btn-outline-dark" :disabled="currentPage < 1" @click="previousPage()">Previous</button>
                    <span class="px-2">Page {{currentPage+1}} of {{totalPages}}</span>
                    <button class="btn btn-sm btn-outline-dark" :disabled="currentPage >= totalPages-1" @click="nextPage()">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import 'amchart'
import 'amchart/pie'
import 'amchart/serial'
import 'amchart/themes/light'
import _ from 'lodash';
import lstring from '~/filters/lstring.js';
import SolrApi from '../../api/solr.js';
import ThesaurusApi from '../../api/thesaurus.js';
import sessionsList from './data/sessions.js';
import typesList from './data/types.js';

const solr      = new SolrApi     ({prefixUrl:window.scbd.apiUrl});
const thesaurus = new ThesaurusApi({prefixUrl:window.scbd.apiUrl});

const baseIndexQuery = 'schema_s:decision-text';

const TYPE_COLORS = { operational: '#2e7d32', informational: '#ef6c00' };

export default {
    name: 'decisionsDashboard',
    data() {
        return {
            sessions      : sessionsList,
            selectedSession: '',
            typeFilter    : null,
            subjectFilter : null,
            subjectTerms  : {},
            records       : null,
            recordsCount  : null,
            pageSize      : 10,
            currentPage   : 0,
            totalPages    : 0,
            error         : null
        }
    },
    created,
    methods: {
        onSessionChange, toggleType, toggleSubject,
        previousPage, nextPage,
        subjectLabel, typeTitle,
        loadCharts, loadTrend, loadTable
    }
}

// ====================================
//
// ====================================

async function created() {
    try {
        const terms = await thesaurus.getDomainTerms('CBD-SUBJECTS');

        // dttSubject_ss holds thesaurus identifiers; a few of them are GUIDs rather than
        // CBD-SUBJECT-* codes, but both are the term's `identifier`.
        this.subjectTerms = terms.reduce((map, term) => {
            if(term.identifier) map[term.identifier] = term;
            return map;
        }, {});
    }
    catch(err) { console.log(err); }   // labels fall back to the raw code

    await Promise.all([this.loadTrend(), this.loadCharts(), this.loadTable()]);
}

async function loadCharts() {
    try {
        const { facet_counts } = await solr.query(AND([baseIndexQuery, sessionQuery(this.selectedSession)]), {
            rows          : 0,
            facetField    : ['dttType_ss', 'dttSubject_ss'],
            facetLimit    : 15,
            facetMinCount : 1
        });

        const types    = pairs(facet_counts?.facet_fields?.dttType_ss);
        const subjects = pairs(facet_counts?.facet_fields?.dttSubject_ss);

        renderDonut(this, typesList.map(({code, title}) => ({
            code, title,
            count: types[code] || 0,
            color: TYPE_COLORS[code]
        })));

        renderSubjects(this, _(subjects)
            .map((count, code) => ({ code, count, label: this.subjectLabel(code) }))
            .value()
            .sort((a, b) => b.count - a.count));
    }
    catch(err) { this.error = errorMessage(err, 'Unable to load the charts.'); }
}

// The per-COP breakdown ignores the COP filter, so it is fetched once. Paragraph docs carry
// no session field — only dttCode_s — hence one facet.query per COP/type pair rather than a pivot.
async function loadTrend() {
    try {
        const keys       = {};
        const facetQuery = [];

        for(const session of sessionsList)
            for(const type of typesList) {
                const key = `${session.code.replace(/-/g, '')}_${type.code}`;
                keys[key] = { session: session.title, type: type.code };
                facetQuery.push(`{!key=${key}}${sessionQuery(session.code)} AND dttType_ss:${type.code}`);
            }

        const { facet_counts } = await solr.query(baseIndexQuery, { rows: 0, facetQuery });
        const counts = facet_counts?.facet_queries || {};

        const bySession = _.reduce(keys, (rows, {session, type}, key) => {
            rows[session]       = rows[session] || { session };
            rows[session][type] = counts[key] || 0;
            return rows;
        }, {});

        renderTrend(this, sessionsList.map(s => bySession[s.title]));
    }
    catch(err) { this.error = errorMessage(err, 'Unable to load the per-COP breakdown.'); }
}

async function loadTable() {
    try {
        // Grouping on dttCode_s turns the paragraph hits into one row per decision and gives
        // both the decision count (ngroups) and the matching-paragraph count per decision.
        const query = AND([
            baseIndexQuery,
            sessionQuery(this.selectedSession),
            this.typeFilter    ? `dttType_ss:(${solr.escape(this.typeFilter)})`       : null,
            this.subjectFilter ? `dttSubject_ss:(${solr.escape(this.subjectFilter)})` : null
        ]);

        const { grouped } = await solr.query(query, {
            rows      : this.pageSize,
            start     : this.currentPage * this.pageSize,
            sort      : 'dttCode_s asc',
            group     : true,
            groupField: 'dttCode_s'
        });

        const groups = grouped?.dttCode_s?.groups || [];

        this.recordsCount = grouped?.dttCode_s?.ngroups || 0;
        this.totalPages   = Math.ceil(this.recordsCount / this.pageSize);

        const decisions = await queryDecisions(groups.map(g => g.groupValue));

        this.records = groups.map(({groupValue, doclist}) => ({
            code      : groupValue,
            paragraphs: doclist.numFound,
            symbol    : decisions[groupValue]?.symbol_s,
            title     : decisions[groupValue]?.title_s,
            session   : groupValue.split('/')[2]?.replace(/^0+/, ''),
            url       : groupValue.replace(/^CBD\//, '').toLowerCase()
        }));
    }
    catch(err) { this.error = errorMessage(err, 'Unable to load the decisions.'); }
}

// Paragraph docs hold the paragraph text, not the decision title; that lives on the parent
// schema_s:decision doc, looked up here by dttCode_s (same as the decision search page).
async function queryDecisions(codes) {
    codes = _(codes).compact().uniq().value();
    if(!codes.length) return {};

    const query = AND(['schema_s:decision', `dttCode_s:(${codes.map(escapePath).join(' ')})`]);
    const { response } = await solr.query(query, { rows: codes.length, fl: 'dttCode_s,title_s,symbol_s' });

    return _(response.docs).reduce((map, doc) => { map[doc.dttCode_s] = doc; return map; }, {});
}

// ====================================
// Charts
// ====================================

function renderDonut(vm, data) {
    if(vm.donut) { vm.donut.dataProvider = data; vm.donut.validateData(); return; }

    vm.donut = AmCharts.makeChart('dashboard-type-chart', { //jshint ignore:line
        'type'         : 'pie',
        'theme'        : 'light',
        'creditsPosition': 'bottom-right',
        'dataProvider' : data,
        'valueField'   : 'count',
        'titleField'   : 'title',
        'colorField'   : 'color',
        'innerRadius'  : '45%',
        'radius'       : '38%',
        'labelsEnabled': false,
        'balloonText'  : '[[title]]: [[value]] paragraphs ([[percents]]%)',
        'legend'       : { 'position': 'bottom', 'valueText': '[[value]]', 'markerType': 'circle' },
        'showZeroSlices': false,
        'startDuration': 0
    });

    vm.donut.addListener('clickSlice', e => vm.toggleType(e.dataItem.dataContext.code));
}

function renderSubjects(vm, data) {
    if(vm.subjects) { vm.subjects.dataProvider = data; vm.subjects.validateData(); return; }

    vm.subjects = AmCharts.makeChart('dashboard-subject-chart', { //jshint ignore:line
        'type'         : 'serial',
        'theme'        : 'light',
        'creditsPosition': 'bottom-right',
        'rotate'       : true,
        'dataProvider' : data,
        'categoryField': 'label',
        'categoryAxis' : { 'gridPosition': 'start', 'labelsEnabled': true },
        'autoMargins'  : false,
        'marginLeft'   : 240,
        'marginRight'  : 20,
        'marginTop'    : 10,
        'marginBottom' : 45,
        'valueAxes'    : [{ 'title': 'Paragraphs' }],
        'graphs'       : [{
            'type'       : 'column',
            'valueField' : 'count',
            'fillAlphas' : 0.9,
            'lineAlpha'  : 0.2,
            'fillColors' : TYPE_COLORS.operational,
            'lineColor'  : TYPE_COLORS.operational,
            'balloonText': '[[category]]: [[value]] paragraphs'
        }],
        'startDuration': 0
    });

    vm.subjects.addListener('clickGraphItem', e => vm.toggleSubject(e.item.dataContext.code));
}

function renderTrend(vm, data) {
    if(vm.trend) { vm.trend.dataProvider = data; vm.trend.validateData(); return; }

    vm.trend = AmCharts.makeChart('dashboard-trend-chart', { //jshint ignore:line
        'type'         : 'serial',
        'theme'        : 'light',
        'creditsPosition': 'bottom-right',
        'dataProvider' : data,
        'categoryField': 'session',
        'categoryAxis' : { 'autoGridCount': false, 'gridCount': sessionsList.length, 'labelRotation': 45 },
        'valueAxes'    : [{ 'stackType': 'regular', 'title': 'Paragraphs' }],
        'legend'       : { 'position': 'top' },
        'graphs'       : typesList.map(({code, title}) => ({
            'title'      : title,
            'type'       : 'column',
            'valueField' : code,
            'fillAlphas' : 0.9,
            'lineAlpha'  : 0.2,
            'fillColors' : TYPE_COLORS[code],
            'lineColor'  : TYPE_COLORS[code],
            'balloonText': '[[category]] — [[title]]: [[value]]'
        })),
        'startDuration': 0
    });

    // Clicking a COP column is the obvious way to drill into that COP.
    vm.trend.addListener('clickGraphItem', e => {
        const session = sessionsList.find(s => s.title === e.item.category);
        if(!session) return;
        vm.selectedSession = vm.selectedSession === session.code ? '' : session.code;
        vm.onSessionChange();
    });
}

// ====================================
// Interaction
// ====================================

function onSessionChange() {
    this.currentPage = 0;
    this.loadCharts();
    this.loadTable();
}

function toggleType(code) {
    this.typeFilter  = this.typeFilter === code ? null : code;
    this.currentPage = 0;
    this.loadTable();
}

function toggleSubject(code) {
    this.subjectFilter = this.subjectFilter === code ? null : code;
    this.currentPage   = 0;
    this.loadTable();
}

function previousPage() {
    if(this.currentPage > 0) { this.currentPage--; this.loadTable(); }
}

function nextPage() {
    if(this.currentPage < this.totalPages-1) { this.currentPage++; this.loadTable(); }
}

function subjectLabel(code) {
    const term = this.subjectTerms[code];
    if(!term) return code;

    const name = lstring(term.shortTitle) || lstring(term.title) || term.name || code;

    return name.length > 34 ? `${name.slice(0, 33)}…` : name;
}

function typeTitle(code) {
    return typesList.find(t => t.code === code)?.title || code;
}

// ====================================
// Helpers
// ====================================

// 'COP-16' -> dttCode_s:CBD\/COP\/16\/*  — decision codes are zero-padded (CBD/COP/06/02).
function sessionQuery(sessionCode) {
    if(!sessionCode) return null;

    return `dttCode_s:${escapePath(`CBD/${padInt(sessionCode).replace(/-/g, '/')}/`)}*`;
}

function escapePath(value) { return solr.escape(value).replace(/\//g, '\\/'); }

function padInt(c) { return c && `${c}`.replace(/\d+/g, d=>d.padStart(2,0)); }

function AND(parts) { parts = (parts||[]).filter(o=>o); return parts.length ? `(${parts.join(' AND ')})` : null; }

// Solr returns facet fields as a flat [value, count, value, count] array.
function pairs(flat) {
    const result = {};
    for(let i=0; i<(flat||[]).length; i+=2) result[flat[i]] = flat[i+1];
    return result;
}

function errorMessage(err, fallback) {
    console.log(err);
    return err?.message || fallback;
}
</script>

<style scoped>
.decisions-dashboard h5 { margin-top: 20px; }
.chart    { width: 100%; }
.chart-sm { height: 300px; }
.chart-lg { height: 340px; }
.chart-tall { height: 420px; }
.chip     { cursor: pointer; margin-right: 4px; }
.pagination { align-items: center; }
</style>
