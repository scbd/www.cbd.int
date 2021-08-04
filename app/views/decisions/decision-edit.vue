<template>
    <div v-if="decision">
        <div class="bg-orange">Decision {{symbol}}</div>
        <!-- TODO - adjust height below -->
        <div class="document" style="height:100vh;overflow-y:scroll;padding:5px">
            <h1>{{decision.title | lstring('en')}}</h1>
            <div v-for="node in decision.nodes" :key="node._id">
                <edit-element 
                    :node="node" 
                    :comments="comments" 
                    :selected-node="selectedNode"
                    :token-reader="tokenReader"
                    @update:selected-node="$emit('update:selected-node', $event);"
                    @addNode="addNode"
                />
            </div>
        </div>
    </div>
</template>

<script>
import DecisionApi from '~/api/decisions.js';
import EditElement from '~/components/decisions/edit-element.vue';
import lstring from '~/filters/lstring.js';

export default {
    name: 'DecisionEdit',
    filters: {
        lstring
    },
    components: {
        EditElement
    },
    data() {
        return {
            api: {},
			decision: null,
            comments: {},
        }
    },
    props: {
        tokenReader: { type: Function, required: false }
    },
    mounted: load,
    methods: {
        loadComments,
        addNode,
        load,
        findNode
    }
}

function findNode(collection, id) {
	if(collection && collection._id && collection._id === id) {
		return collection;
	} else if (!_.isEmpty(collection.nodes)) {
		let result = null;
		collection.nodes.forEach(node => {
			if(result) return;
			result = findNode(node, id);
		});
		return result;
	}
	return null;
}

async function load() {
    const { $route: route } = this;

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
    this.decision = decision;

    this.comments = await this.loadComments(code);
}

async function loadComments(code) {
    try {
        const params =  { q: { type:'decision', resources: code }};
        const res = await this.api.getDecisionComments(params);
        const {data} = res;
        let comments = {};
        data.forEach(function(comment){
        comment.resources.forEach(function(key){
            comments[key] = comments[key] || [];
            comments[key].push(comment);
        });
        return comments;
    });    
    } catch (error) {
        return {};
    }
}

async function addNode(params) {
    await this.api.addNodeToDecisionTree(this.decision._id, params);
    await this.load();
}

function pad(input) {
	var output = (input || '').toString();
	while(output.length<2) output = '0' + output;
	return output;
}
</script>
