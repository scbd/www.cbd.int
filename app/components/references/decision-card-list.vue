<template>
    <div>
        <div 
            v-for="decision in decisionList"
            :key="decision.symbol"
            class="card" 
            style="margin-bottom:4px">
            <div class="card-body" style="padding:12px;font-size:0.9em">
                <decision-card :decision="decision"/>
            </div>
        </div>
    </div>
</template>

<script>
import DecisionCard from '~/components/references/decision-card.vue'
import Api from '~/components/meetings/api.js';
import _ from 'lodash';

export default {
    name: 'DecisionCardList',
    components: { DecisionCard },
    props: {
        decisions: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            api: new Api(),
            decisionList: [],
        }
    },
    created, 
    methods: {
        lookupDecisions
    }
}

async function created() {

    const codes = this.decisions.filter(c => !!c);

    const urlCodes = codes.filter(c => isUrl(c)).map(c => ({url: c, code: c, elements: []}));

    const decisions = await this.lookupDecisions(codes.filter(c => !isUrl(c)));

    const decisionList = [...decisions, ...urlCodes];

    this.decisionList = decisionList;
    //this.decisionList = codes.map(c => decisionList.find(dl => dl.code === c || dl.elements.some(e => e.code === getElementCode(c))) || {code: c, elements: []});
}

async function lookupDecisions(codes) {
    if(!codes || codes.length === 0) return [];

    const elementCodes = codes.map(c => getElementCode(c));

    const options = {
        cache: true,
        params: {
            q:  { $or: [ { 'code' : { $in: [...codes] } }, { 'elements.code' : { $in: [ ...elementCodes] } } ]},
            //f:  { "code":1, "symbol":1, "treaty":1, "body":1, "session":1, "decision":1, "meeting":1, "title":1, "elements.code":1, "elements.section":1, "elements.paragraph":1, "elements.item":1, "elements.subitem":1, "elements.text":1 },
            //l: 1
        }
    }

    const results = await this.api.getDecisions(options);
    
    if(!results || results.length === 0) return [];

    //TODO need to do for same decision multiple paragraph
    results.forEach(d => {
        d.url = 'decisions/'+d.body.toLowerCase()+'/'+d.session+'/'+d.decision;
        d.elements = d.elements.filter(e => codes.some(c => e.code === getElementCode(c)));
        //d.elements = d.elements.filter(e => e.code === getElementCode(d.code));

        if(d.elements[0]) {
            const ele = d.elements[0];
            d.url += '/'+(ele.section || '')+ele.paragraph;
        }
    });

    return results || [];
}

function getElementCode(text) {
    return text.replace(/(\w+\/\w+\/\w+\/\w+)\/(.+)/, '$1.$2');
}

function isUrl(text) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i.test(text||'');
}
</script>