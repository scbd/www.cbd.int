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
                <h5>Decision type</h5>
                <div id="dashboard-type-chart" class="chart chart-sm"></div>
            </div>
            <div class="col-md-8">
                <h5>Subjects</h5>
                <div id="dashboard-subject-chart" class="chart chart-tall"></div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <h5>Requests to the Executive Secretariat, SBSTTA and SBI per COP <small class="text-muted">(all COPs — not affected by the filters)</small></h5>
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
                    <span v-if="typeFilter">
                        <span class="badge chip badge-primary">
                            {{typeTitle(typeFilter)}}
                            <i class="fa fa-minus-circle" @click="toggleType(typeFilter)"></i>
                        </span>
                    </span>

                    <span v-if="subjectFilter">
                        <span class="badge chip badge-primary">
                            {{subjectLabel(subjectFilter)}}
                            <i class="fa fa-minus-circle" @click="toggleSubject(subjectFilter)"></i>
                        </span>
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
                    <button :disabled="currentPage < 1" @click="previousPage()">Previous</button>
                    <span>Page {{currentPage+1}} of {{totalPages}}</span>
                    <button :disabled="currentPage >= totalPages-1" @click="nextPage()">Next</button>
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

const MAX_DECISIONS = 1000;   // DTT holds 506 COP decisions today

const TYPE_COLORS = { operational: '#17a2b8', informational: '#6c757d', subject: '#449951' };

// dttActor_ss values are case-sensitive and must match the index exactly.
const TREND_ACTORS = [
    { code: 'executive-secretary', title: 'Executive Secretary', color: '#1c473b' },
    { code: 'SBSTTA',              title: 'SBSTTA',              color: '#1565c0' },
    { code: 'SBI',                 title: 'SBI',                 color: '#ef6c00' }
];

export default {
    name: 'decisionsDashboard',
    data() {
        return {
            sessions      : [...sessionsList].reverse(),
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
// no session field — only dttCode_s — hence one facet.query per COP/actor pair rather than a pivot.
async function loadTrend() {
    try {
        const keys       = {};
        const facetQuery = [];

        for(const session of sessionsList)
            for(const actor of TREND_ACTORS) {
                // facet keys must be plain identifiers, so strip the dashes the codes carry
                const key = `${session.code}_${actor.code}`.replace(/-/g, '_');
                keys[key] = { session: session.title, actor: actor.code };
                facetQuery.push(`{!key=${key}}${sessionQuery(session.code)} AND dttActor_ss:${solr.escape(actor.code)}`);
            }

        const { facet_counts } = await solr.query(baseIndexQuery, { rows: 0, facetQuery });
        const counts = facet_counts?.facet_queries || {};

        const bySession = _.reduce(keys, (rows, {session, actor}, key) => {
            rows[session]        = rows[session] || { session };
            rows[session][actor] = counts[key] || 0;
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

        // Wanted order is newest COP first but decisions ascending within it, and dttCode_s is
        // the only sortable field on a paragraph doc — one key cannot do both directions. So pull
        // every matching decision at once (506 today, ~100KB) and order and page it here.
        // ponytail: whole set in one request; switch to per-COP paging if the corpus ever outgrows MAX_DECISIONS.
        const { grouped } = await solr.query(query, {
            rows      : MAX_DECISIONS,
            group     : true,
            groupField: 'dttCode_s'
        });

        const groups = grouped?.dttCode_s?.groups || [];

        this.recordsCount = grouped?.dttCode_s?.ngroups || 0;
        this.totalPages   = Math.ceil(this.recordsCount / this.pageSize);

        const ordered = groups
            .map(({groupValue, doclist}) => ({ ...parseCode(groupValue), code: groupValue, paragraphs: doclist.numFound }))
            .sort((a, b) => b.session - a.session || a.decision - b.decision || a.code.localeCompare(b.code));

        const start = this.currentPage * this.pageSize;
        const page  = ordered.slice(start, start + this.pageSize);

        const decisions = await queryDecisions(page.map(r => r.code));

        this.records = page.map(row => ({
            ...row,
            symbol: decisions[row.code]?.symbol_s,
            title : decisions[row.code]?.title_s,
            url   : row.code.replace(/^CBD\//, '').toLowerCase()
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
            'fillColors' : TYPE_COLORS.subject,
            'lineColor'  : TYPE_COLORS.subject,
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
        'valueAxes'    : [{ 'title': 'Paragraphs', 'minimum': 0 }],
        'legend'       : { 'position': 'top' },
        'chartCursor'  : { 'cursorPosition': 'mouse', 'zoomable': false },
        'graphs'       : TREND_ACTORS.map(({code, title, color}) => ({
            'title'      : title,
            'type'       : 'line',
            'valueField' : code,
            'lineThickness': 2,
            'lineColor'  : color,
            'bullet'     : 'round',
            'bulletSize' : 8,
            'balloonText': '[[category]] — [[title]]: [[value]] paragraphs'
        })),
        'startDuration': 0
    });

    // Clicking a COP point is the obvious way to drill into that COP.
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
    this.error = null;
    this.currentPage = 0;
    this.loadCharts();
    this.loadTable();
}

function toggleType(code) {
    this.error = null;
    this.typeFilter  = this.typeFilter === code ? null : code;
    this.currentPage = 0;
    this.loadTable();
}

function toggleSubject(code) {
    this.error = null;
    this.subjectFilter = this.subjectFilter === code ? null : code;
    this.currentPage   = 0;
    this.loadTable();
}

function previousPage() {
    if(this.currentPage > 0) { this.error = null; this.currentPage--; this.loadTable(); }
}

function nextPage() {
    if(this.currentPage < this.totalPages-1) { this.error = null; this.currentPage++; this.loadTable(); }
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

// 'CBD/COP/16/01' -> { session: 16, decision: 1 } for ordering; both are zero-padded in the code.
function parseCode(code) {
    const [, , session, decision] = (code || '').split('/');

    return { session: parseInt(session, 10) || 0, decision: parseInt(decision, 10) || 0 };
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
.chip {
    display: inline-block;
    padding: 5px;
    font-size: 12px;
    border-radius: 3px;
    margin: 2px;
    cursor: pointer;
}
.filter-chips { margin-bottom: 12px; }

/* pagination rules copied from decision-search.vue so both pages match */
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
</style>
