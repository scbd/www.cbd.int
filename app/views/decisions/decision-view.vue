<template>
<div class="decision-tracking" v-if="decision">
	
	<header-decisions>
		<span class="float-right">
			<decision-view-help title="Help" />
			<a href="javascript:void(0)" v-if="canComment" class="btn btn-default" @click="edit('comment')" style="margin-top:2px;color:inherit">
				<i class="fa fa-comment-o" aria-hidden="true"></i>
			</a>
			<a href="javascript:void(0)" v-if="canEdit" class="btn btn-default" @click="edit()" style="margin-top:2px;color:inherit">
				<i class="fa fa-edit" aria-hidden="true"></i>
			</a>
		</span>						
		<h1><span id="step1">Decision {{decision.body | uppercase}} {{romans[decision.session]}}/{{decision.decision}}</span></h1>
	</header-decisions>

    <div class="view-decision row">
		<div class="col-md-6">
			<div class="document card border-primary">
    			<div class="card-header bg-primary text-white">
    				<b v-if="decision" id="step2">{{decision.symbol || 'TODO'}}</b>

					<div class="float-right">
						<select id="step3" v-model="selectedLocale" class="badge badge-info">
							<option 
								v-for="(language, locale) in languages"
								:key="locale" 
								:value="locale">
								{{language}}
							</option>
						</select>

						<a href="javascript:void(0)" v-if="filters && Object.keys(filters).length > 0" class="badge badge-info" @click="filters = {}" style="margin-top:2px">
							<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> filtered <i class="fa fa-times" aria-hidden="true"></i>
						</a>
					</div>
    			</div>
    			<div class="card-body scrollable-section">
					<h3 :lang="selectedLocale">{{decision.title | lstring(this.selectedLocale)}}</h3>
					<div v-for="node in decision.nodes" :key="node._id">
						<view-element 
							:node="node" 
							:filters="filters"
							:selectedNode.sync="selectedNode"
							:locale="selectedLocale"
						/>
					</div>
    			</div>
            </div>
		</div>
		<div class="col-md-6">
			<div class="document card border-grey">
				<div class="card-body scrollable-section">
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
						</dd>
						<br>

						<dt>Elements of decision</dt>
						<dd>
							<a href="javascript:void(0)" class="badge badge-secondary text-nowrap" 
								@click="toggleFilters({ types: null })" 
								:class="{ disabled : filters && filters.types }">
								{{ sum(counts.types) }} 
								<i v-if="filters && filters.types" class="fa fa-times" aria-hidden="true"></i>
							</a>
							<a v-for="type in allFilters.types" :key="type.code"
								href="javascript:void(0)" class="badge text-nowrap" 
								style="margin-right:3px;"
								@click="toggleFilters({ types: [type.code] })" 
								:class="`${!isFilterSelected('types', type.code) && 'disabled'} ${type.class || 'badge-secondary'}`" >
								{{ counts.types[type.code] || 0 }} {{type.title}} 
								<i class="fa fa-filter" aria-hidden="true"></i>
							</a>
						</dd>
						<dd>
							<a href="javascript:void(0)" class="badge badge-secondary text-nowrap" 
								@click="toggleFilters({ statuses : null })" 
								:class="{ disabled : filters && filters.statuses }">
								{{ sum(counts.statuses) }}
								<i v-if="filters && filters.statuses" class="fa fa-times" aria-hidden="true"></i>
							</a>
							<a 
								v-for="status in allFilters.statuses" :key="status.code"
								href="javascript:void(0)" class="badge text-nowrap" 
								style="margin-right:3px;"
								@click="toggleFilters({ statuses : [status.code]})"
								:class="`${!isFilterSelected('statuses', status.code) && 'disabled'} ${status.class || 'badge-secondary'}`" >
								{{ counts.statuses[status.code] || 0 }} {{ status.title }} 
								<i class="fa fa-filter" aria-hidden="true"></i>
							</a>
						</dd>

						<dt>Actors</dt>
						<dd>
							<a href="javascript:void(0)" class="badge badge-secondary text-nowrap" 
								@click="toggleFilters({ actors : null })" 
								:class="{ disabled : filters &&  filters.actors }">
								{{ sum(counts.actors) }} 
								<i v-if="filters && filters.actors" class="fa fa-times" aria-hidden="true"></i>
							</a>
							<a
								v-for="actor in allFilters.actors" :key="actor.code"
								href="javascript:void(0)" class="badge text-nowrap" 
								style="margin-right:3px;"
								@click="toggleFilters({ actors : [actor.code] })" 
								:class="`${!isFilterSelected('actors', actor.code) && 'disabled'} ${actor.class || 'badge-secondary'}`" >
								{{counts.actors[actor.code]}} {{actor.title}} 
								<i class="fa fa-filter" aria-hidden="true"></i>
							</a>
						</dd>

						<dt>AICHI targets</dt>
						<dd>
							<a href="javascript:void(0)" class="badge badge-secondary text-nowrap" 
								@click="toggleFilters({ aichiTargets : null })" 
								:class="{ disabled : filters &&  filters.aichiTargets }">
								{{sum(counts.aichiTargets)}} 
								<i v-if="filters && filters.aichiTargets" class="fa fa-times" aria-hidden="true"></i>
							</a>
							<span class="chip-sm" 
								v-for="aichiTarget in allFilters.aichiTargets" 
								:key="aichiTarget" 
								@click="toggleFilters({ aichiTargets : [aichiTarget] })" 
								:class="`${!isFilterSelected('aichiTargets', aichiTarget) && 'disabled'} 'badge-secondary'`" >
									<img :title="aichiTarget.description" 
									:src="`/app/images/aichi-targets/abt-${aichiTarget.replace('AICHI-TARGET-','')}-96.png`" 
									width="20" style="margin: 1px 1px 1px 1px;">
							</span>
						</dd>
						<br>

						<dt>Subjects</dt>
						<dd>
							<a href="javascript:void(0)" class="badge badge-secondary text-nowrap" 
								@click="toggleFilters({ subjects : null })" 
								:class="{ disabled : filters &&  filters.subjects }">
								{{sum(counts.subjects)}} 
								<i v-if="filters && filters.subjects" class="fa fa-times" aria-hidden="true"></i>
							</a>

							<a href="javascript:void(0)" class="badge text-nowrap" 
								v-for="subject in allFilters.subjects" 
								:key="subject.code"
								style="margin-right:3px;"
								@click="toggleFilters({ subjects : [subject.code] })" 
								:class="`${!isFilterSelected('subjects', subject.code) && 'disabled'} ${subject.class || 'badge-secondary'}`" >
								{{counts.subjects[subject.code]}} {{subject.title}}
							</a> 
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
</div>
</template>

<script>
import _ from 'lodash';
import DecisionApi from '~/api/decisions.js';
import ViewElement from '~/components/decisions/view-element.vue';
import types from '~/views/decisions/data/types.js';
import actors from '~/views/decisions/data/actors.js';
import romanChars from '~/views/decisions/data/romans.js';
import statuses from '~/views/decisions/data/statuses.js';
import aichiTargets from '~/data/reports/aichiTargets.json';
import DocumentFiles from '~/components/references/document-files.vue';
import DecisionCardList from '~/components/references/decision-card-list.vue';
import MeetingCardList from '~/components/references/meeting-card-list.vue';
import term from '~/filters/term.js';
import languages from '~/data/languages.js';
import lstring from '~/filters/lstring.js';
import DecisionViewHelp from '~/components/decisions/decision-view-help.vue';

const scrollOptions = {
	block: 'center',
	behavior: "smooth"
};

export default {
    name: 'DecisionView',
	components: {
		ViewElement,
		DocumentFiles,
		DecisionCardList,
		MeetingCardList,
		DecisionViewHelp
	},
    filters: {
		lstring,
        uppercase(text) {
            return (text??'').toString().toUpperCase();
        },
        lowercase(text) {
            return (text??'').toString().toLowerCase()
        }
    },
    props: {
		route: { type: Object, required: false },
		router: { type: Object, required: false },
		tokenReader: { type: Function, required: false },
		user: { type: Object, required: false}
	},
	data() {
		return {
			api: {},
			decision: null,
			documents: [],
			filters: {},
			allFilters: {},
			selectedNode: null,
			selectedLocale: 'en'
		}
	},
    computed: {
		types() { return types},
		actors() { return actors},
        statuses() { return statuses},
        romans() { return romanChars},
		aichiTargets() { return aichiTargets},
		languages() {return languages},
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
		counts() {
			const {decision, selectedNode} = this;
			
			const collection = findNode(decision, selectedNode) || decision;
			let counts = {};
			counts.types = _.countBy(getTags(collection, "type", true));
			counts.statuses = _.countBy(getTags(collection, "statuses", true));
			counts.actors = _.countBy(getTags(collection, "actors", true));
			counts.aichiTargets = _.countBy(getTags(collection, "aichiTargets", true));
			counts.subjects = _.countBy(getTags(collection, "subjects", true));
			return counts;
		}
    },
	watch: {
		selectedNode: onChangeSelectedNode,
		filters() {
			this.$nextTick().then(() => {
				document.querySelector(".paragraph:not(.dimmed)").scrollIntoView(scrollOptions);	
			});
		}
	},
    methods: {
		edit,
		toggleFilters,
		loadRelatedDecisions,
		loadDocuments,
		isFilterSelected,
		lookupTermText,
		loadFilters,
		sum,
		onChangeSelectedNode
    },
	mounted: load
}

function findNode(collection, code) {
	if(collection && collection.code && collection.code.indexOf(code) === 0) {
		return collection;
	} else if (!_.isEmpty(collection.nodes)) {
		let result = null;
		collection.nodes.forEach(node => {
			if(result) return;
			result = findNode(node, code);
		});
		return result;
	}
	return null;
}

async function load() {
	const { $route: route, $router: router } = this;

	this.api = new DecisionApi(this.tokenReader);
	
	let treaty    = null ;
	const body      = route.params.body.toUpperCase();

	if(body=='COP') treaty = { code : "XXVII8" } ;

	if(!treaty) {
		//alert('ONLY "COP" DECISIONS ARE SUPPORTED');
		throw 'ONLY "COP" DECISIONS ARE SUPPORTED';
	}

	const pathParser = /^(?<dec>\d+)(?:\/(?<para>.*))?/;

	if(!pathParser.test(route.params.decision)) throw Error("Invalid path")

	const parsed = pathParser.exec(route.params.decision);
	const session = parseInt(route.params.session);
	const number  = parseInt(parsed.groups.dec);
	const para    = parsed.groups?.para?.toUpperCase();

	treaty = await this.api.getTreaties(treaty.code);

	const code = treaty.acronym+'/'+body+'/'+pad(session)+'/'+pad(number);

	const decision = await this.api.queryDecisionTree(code);
	const relatedDecisions = await this.loadRelatedDecisions(decision.code);
	decision.decisions = _.union(decision.decisions||[], relatedDecisions);
	this.decision = decision;

	this.documents = await this.loadDocuments(decision);

	await this.loadFilters();

	if(para) {
		const node = `${code}/${para}`.replace(/\d+/g, pad);
		const element = document.querySelector(`a[name="${node.replace(/\//g, '-')}"]`);
		if(element) { 
			this.selectedNode = node;
			element.scrollIntoView(scrollOptions);
		}
		else {
			const path = route.path.substring(0, route.path.lastIndexOf("/"));
			router.replace({path}); //TODO
		}
	}
}

async function loadFilters() {
	const {decision, selectedNode} = this;

	let allFilters = {};

	if(!decision) {
		this.$set({}, "allFilters", {});
		return;
	}

	const collection = findNode(decision, selectedNode) || decision

	allFilters.types = getTags(collection, "type").map(tag => types.find(item => item.code === tag) || tag);
	allFilters.statuses = getTags(collection, "statuses").map(tag => statuses.find(item => item.code === tag) || tag);
	allFilters.actors = getTags(collection, "actors").map(tag => actors.find(item => item.code === tag) || tag);
	allFilters.aichiTargets = getTags(collection, "aichiTargets").map(tag => aichiTargets.find(item => item.index === tag) || tag);

	//load subjects
	const codes = getTags(collection, 'subjects');
	const subjects = codes.map(async code => {
		const title = await lookupTermText(code) 
		return {code , title}
	});
	const data = await Promise.all(subjects);
	allFilters.subjects = data;

	this.$set(this, 'allFilters', allFilters);
}

async function onChangeSelectedNode(selectedNode) {
	const {decision, $route: route, $router: router} = this;

	await this.loadFilters();

	const body = route.params.body.toUpperCase();

	const {code} = findNode(decision, selectedNode) || decision;

	const path = `${code.substring(code.indexOf(body))}`.toLowerCase();
	router.replace({path});
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
}

function edit(hash) {
	const pathParser = /^(?<dec>\d+)(?:\/(?<para>.*))?/;

	const {$route: route, $router: router} = this;
	
	const body = route.params.body.toUpperCase();
	const parsed = pathParser.exec(route.params.decision);
	const session = parseInt(route.params.session);
	const decision  = parseInt(parsed.groups.dec);

	hash = hash ? `#${hash}` : '';
	const path = `${body}/${pad(session)}/${pad(decision)}/edit${hash}`.toLowerCase();
	router.push({path});
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

function getTags(collection, field, all) {
	let list = [];
	if(!_.isEmpty(collection[field])) list.push(collection[field]);

	if(!_.isEmpty(collection.nodes)) {
		collection.nodes.forEach((node) => {
			var sublist = getTags(node, field, all);
			list.push(sublist);
		});
	}

	if(all) return _(list).flatten().value(); 

	return _(list).flatten().uniq().value();
}

async function lookupTermText(code) {
	var termCode = {identifier:code};
	const text = await term(termCode);
	return text;
}

function sum(object) {
	return _.sum(_.values(object));
}

</script>

<style scoped>
.disabled {
	opacity: 50%;
}

.scrollable-section {
	overflow: scroll;
	height: 100vh;
	padding-bottom: 300px;
}

.card-header:first-child {
    position: sticky;
    top: 0px;
    z-index: 1;
}

[lang="ar"] {
  direction:rtl;
  text-align: right;
}
</style>