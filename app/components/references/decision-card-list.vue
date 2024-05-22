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
import DecisionApi from '~/api/decisions.js';

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
            decisionapi: new DecisionApi(),
            api: new Api(),
            decisionList: [],
        }
    },
    created:refresh,
    watch:{
        decisions: refresh
    },
    methods: {
        lookupDecisions
    }
}

async function refresh() {

    const codes = this.decisions.filter(c => !!c);

    const urlCodes = codes.filter(c => isUrl(c)).map(c => ({url: c, code: c, elements: []}));

    const decisions = await this.lookupDecisions(codes.filter(c => !isUrl(c)));

    const decisionList = [...decisions, ...urlCodes];

    this.decisionList = decisionList;
}

async function lookupDecisions(codes) {
    if(!codes || codes.length === 0) return [];

    const elementCodes = codes.map(c => getElementCode(c));

    const q = { $or: [ { 'code' : { $in: [...codes] } }, { 'elements.code' : { $in: [ ...elementCodes] } } ]}
    const results = await this.decisionapi.getDecisions({ q, cache: true });

    if(!results || results.length === 0) return [];

    results.forEach(d => {
        d.url = '/decisions/'+encodeURIComponent(d.body.toLowerCase())+'/'+encodeURIComponent(d.session)+'/'+encodeURIComponent(d.decision);
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