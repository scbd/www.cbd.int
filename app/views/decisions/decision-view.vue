<template>
<div class="decision-tracking" v-if="decision">
	<header-decisions>
		<span class="float-right">
			<a href="#" v-if="canComment" class="btn btn-default" @click="edit('comment')" style="margin-top:2px;color:inherit">
				<i class="fa fa-comment-o" aria-hidden="true"></i>
			</a>
			<a href="#" v-if="canEdit" class="btn btn-default" @click="edit()" style="margin-top:2px;color:inherit">
				<i class="fa fa-edit" aria-hidden="true"></i>
			</a>
		</span>						
		<h1>Decision {{decision.body | uppercase}} {{romans[decision.session]}}/{{decision.decision}}</h1>
	</header-decisions>

    <div class="view-decision row">
		<div class="col-md-6">
			<div class="document card border-primary">
    			<div class="card-header bg-primary text-white">
    				<b v-if="decision">UNEP/CBD/COP/DEC/{{decision.session}}/{{decision.decision}}</b>
    				<a href="#" v-if="filters" class="float-right badge badge-info" @click="filter(null)" style="margin-top:2px">
    					<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> filtered <i class="fa fa-times" aria-hidden="true"></i>
    				</a>
    			</div>
    			<div class="card-body">
					<h3>{{decision.title.en}}</h3>
    				<div v-for="node in decision.nodes" :key="node._id">
						<view-element 
							:node="node" 
							:filters="filters"
							:selectedNode.sync="selectedNode"
						/>
					</div>
    			</div>
            </div>
		</div>
		<div class="col-md-6" style="padding-top:16px">
			<div id="decision-meta">
			<dl>
				<dt v-if="decision.body">Body</dt>
                <dd v-if="decision.body">
                    <span v-if="decision.body === 'COP'">Conference of the Parties (COP)</span>
                    <span v-else>{{ decision.body | uppercase }}</span>
                </dd>

				<br v-if="decision.body">

				<dt v-if="decision.meeting">Meeting</dt>
				<dd v-if="decision.meeting">
					<meeting-card-list :meetings="[decision.meeting]" />
                    <decision-meeting symbol="decision.meeting"></decision-meeting>
                </dd>
				<dt>Elements of decision</dt>
				<dd>
					<a href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ types: null })" 
						:class="{ disabled : filters && filters.types }">
						{{counts.types}}
					</a>
					<a v-for="type in types" :key="type.code"
						href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ types: [type.code] })" 
						:class="!isFilterSelected('types', type.code) && 'disabled'" >
						{{counts.types}} {{type.title}} 
						<i class="fa fa-filter" aria-hidden="true"></i>
					</a>
				</dd>
				<dd>
					<a href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ statuses : null })" 
						:class="{ disabled : filters && filters.statuses }">
						{{counts.statuses}}
					</a>
					<a 
						v-for="status in statuses" :key="status.code"
						href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ statuses : [status.code]})"
						:class="!isFilterSelected('statuses', status.code) && 'disabled'" >
						{{counts.statuses}} {{status.title}} 
						<i class="fa fa-filter" aria-hidden="true"></i>
					</a>
				</dd>

				<dt>Actors</dt>
				<dd>
                    <a href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ actors : null })" 
						:class="{ disabled : filters &&  filters.actors }">
						{{counts.actors}}
					</a>
					<a
						v-for="actor in actors" :key="actor.code"
						href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ actors : [actor.code] })" 
						:class="!isFilterSelected('actors', actor.code) && 'disabled'">
						{{counts.actors}} {{actor.code}} 
						<i class="fa fa-filter" aria-hidden="true"></i>
					</a>
				</dd>

				<dt>AICHI targets</dt>
				<dd>
					<a href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ aichiTargets : null })" 
						:class="!isFilterSelected('aichiTargets', 'aichiTarget') && 'disabled'">
						{{counts.aichiTargets}}</a>
					<span class="chip-sm" v-for="aichiTarget in aichiTargets" :key="aichiTarget" 
                        v-show="aichiTargets && aichiTargets.length > 0"
						:class="!isFilterSelected('aichiTargets', aichiTargets.index) && 'disabled'">
							<img :title="aichiTarget.description" 
							:src="`/app/images/aichi-targets/abt-${aichiTarget.index}-96.png`" 
							width="20" style="margin: 1px 1px 1px 1px;">
					</span>
					<!-- </a>  -->
				</dd>
				<br>

				<dt>Subjects</dt>
				<dd>
					<a href="#" class="badge badge-secondary text-nowrap" 
						@click="toggleFilters({ subjects : null })" 
						:class="{ disabled : filters &&  filters.subjects }">
						{{counts.subjects}}
					</a>
					<span style="margin-right:3px;" v-for="subject in subjects" :key="subject">
                        <a href="#" class="badge badge-secondary text-nowrap" 
						 :class="!isFilterSelected('subjects', 'subject')">
							 {{subject}}
						</a> 
                    </span>
				</dd>
				<br>

				<div v-if="documents && documents.length > 0">
					<dt>Document</dt>
					<dd v-for="d in documents" :key="d">
						<div class="card" style="margin-bottom:4px">
							<div class="card-body" style="padding:12px;font-size:0.9em">
								<document-files :files="d.files" class="visible-xs pull-right"></document-files>
								<b>{{d.symbol}}</b>
								<div>{{ decision.title | lstring }}</div>
								<document-files class="hidden-xs" :files="d.files"></document-files>
							</div>
						</div>
					</dd>
				</div>

				<span v-if="decision.decisions && decision.decisions.length > 0">
    				<dt>Related decisions</dt>
					<dd>
						<decision-card-list :decisions="decision.decisions" />
					</dd>
    				<br>
				</span>

			</dl>
			</div>	
		</div>
    </div>
</div>
</template>

<script>
import _ from 'lodash';
import DecisionApi from '~/api/decisions.js';
import ViewElement from '~/components/decisions/view-element.vue';
import types from '~/views/decisions/data/types.js';
import actors from '~/views/decisions/data/actors.js';
import romans from '~/views/decisions/data/romans.js';
import statuses from '~/views/decisions/data/statuses.js';
import aichiTargets from '~/data/reports/aichiTargets.json';
import DocumentFiles from '~/components/references/document-files.vue';
import DecisionCardList from '~/components/references/decision-card-list.vue';
import MeetingCardList from '~/components/references/meeting-card-list.vue';

export default {
    name: 'DecisionView',
	components: {
		ViewElement,
		DocumentFiles,
		DecisionCardList,
		MeetingCardList
	},
    filters: {
        uppercase(text) {
            return (text + '').toUpperCase();
        },
        lowercase(text) {
            return (text + '').toLowerCase()
        }
    },
    props: {
		route: { type: Object, required: false },
		tokenReader: { type: Function, required: false },
		user: { type: Object, required: false}
	},
	data() {
		return {
			api: {},
			decision: null,
			documents: [],
			filters: {},
			counts: {},
		}
	},
    computed: {
		types() { return types},
		actors() { return actors},
        statuses() { return statuses},
        romans() { return romans},
		aichiTargets() { return aichiTargets},
		canEdit() {
			return true;
			// const { $auth } = this;
			// const { user } = $auth;
			// return _.intersection(user.roles, ["Administrator","DecisionTrackingTool"]).length>0
		},
		canComment() {
			return true;
			// const { $auth } = this;
			// const { user } = $auth;
			// return canEdit || _.intersection(user.roles, ["ScbdStaff"]).length>0;
		},
    },
    methods: {
		edit,
		sumValues,
		toggleFilters,
		resetCount,
		loadRelatedDecisions,
		loadDocuments,
		isFilterSelected
    },
	mounted: load
}

async function load() {
	const { route, user } = this;

	console.log('----------'+user);
	
	this.api = new DecisionApi(this.tokenReader);
	
	let treaty    = null ;
	const body      = route.params.body.toUpperCase();
	const session   = parseInt(route.params.session);
	const number    = parseInt(route.params.decision);

	if(body=='COP') treaty = { code : "XXVII8" } ;

	if(!treaty) {
		//alert('ONLY "COP" DECISIONS ARE SUPPORTED');
		throw 'ONLY "COP" DECISIONS ARE SUPPORTED';
	}

	treaty = await this.api.getTreaties(treaty.code);

	const code = treaty.acronym+'/'+body+'/'+pad(session)+'/'+pad(number);

	const decision = await this.api.queryDecisionTree(code);
	const relatedDecisions = await this.loadRelatedDecisions(decision.code);
	decision.decisions = _.union(decision.decisions||[], relatedDecisions);
	this.decision = decision;

	this.documents = await this.loadDocuments(decision);

	this.resetCount();
}

async function loadDocuments(decision) {
	const params = {
		fl: 'id,symbol_s,schema_s,position_i,meeting_ss,title_*, description_*,file_ss,url_ss',
		q : 'schema_s:(decision recommendation) AND treaty_s:'+decision.treaty + ' AND body_s:'+decision.body + ' AND session_i:'+decision.session + ' AND decision_i:'+decision.decision, 
		rows:999
	};
	const result = await this.api.getDecisionDocuments(params);
	return _(result.data.response.docs).map(function(n) {
		const doc = _.defaults(n, {
			_id: n.id,
			symbol: n.symbol_s,
			type:   n.schema_s.replace(/^x-/, ''),
			status : 'public',
			title : { en : n.title_t },
			files : _.map(n.file_ss, function(f){ return JSON.parse(f); }),
			url :  n.url_ss[0]
		});

		if(!doc.files || doc.files.length === 0)
			doc.files = [{ language:'en', url:doc.url,  type:'text/html' }];

		return doc;
	}).sortByOrder(['position_i', 'symbol_s'], ['asc', 'asc']).value();
}

async function loadRelatedDecisions(code){

	var WithDot   = code.replace(/(\w+\/\w+\/\w+\/\w+)\/(.+)/, '$1.$2');
	var WithSlash = code.replace(/(\w+\/\w+\/\w+\/\w+)\.(.+)/, '$1/$2');

	var params = {
		q : { "decisions" : { "$in" : [WithDot, WithSlash]} },
		f : { "code":1 }
	};

	const result = await this.api.getRelatedDecisions(params);
	return _.map(result.data, "code");
}

function resetCount() {
	const {counts} = this;
	counts.types = 0;
	counts.statuses = 0;
	counts.aichiTargets = 0;
	counts.subjects = 0;
	counts.actors = 0;
}

function toggleFilters(newFilters) {

	let filters = {};
	const oldFilters = this.filters || {};

	var keys = _.union(_.keys(oldFilters), _.keys(newFilters || {}));

	keys.forEach(function(key) {

		var o = oldFilters[key] || [];
		var n = newFilters[key] || [];
		var r = _(_.difference(o,n)).union(_.difference(n,o)).compact().value();

		if(newFilters[key]===null) r = null;

		if(!_.isEmpty(r)) {
			filters = filters || {};
			filters[key] = r;
		}
	});

	this.filters = filters;
	//updateSums(filters);
}

function sumValues(o) {
	return _(o||{}).values().reduce(function(a,v) { return a+v; }, 0);
}

function isMatch(entry, filters) {

	if(!filters) return true;

	const { actors, statuses, types, aichiTargets, subjects} = filters;

	if(actors) return _(actors).intersection(entry.data.actors).some();
	if(statuses) return _(statuses).intersection(entry.data.statuses).some();
	if(types) return _(types).intersection([entry.data.type]).some();

	if(aichiTargets) return _(aichiTargets).intersection(entry.data.aichiTargets).some();
	if(subjects) return _(subjects).intersection(entry.data.subjects).some();

	return true;
}
function edit(hash) {

	// window.location.url(('/'+decision.body+'/'+decision.session+'/'+decision.decision+'/edit').toLowerCase());

	// if(hash)
	// 	$location.hash(hash);
}

function pad(input) {

	var output = (input || '').toString();

	while(output.length<2) output = '0' + output;

	return output;
}

function isFilterSelected(type, code) {
	const {filters} = this;

	if(_.isEmpty(filters)) return true;

	if(_.isEmpty(filters[type])) return false;

	return filters[type].some((c) => c === code);
}

</script>

<style scoped>
.disabled {
	opacity: 50%;
}
</style>