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
    created
}

async function created() {
    let { decisionList } = this;
    this.decisions.forEach(async decisionCode => {
        decisionList.push(await lookupDecision.call(this, decisionCode));
    });
}

async function lookupDecision(code) {

    if(!code) return;

    if(isUrl(code || '')) return {url: code}

    const elementCode = code.replace(/(\w+\/\w+\/\w+\/\w+)\/(.+)/, '$1.$2');

    const options = {
      cache: true,
      params: {
          q:  { $or: [ { 'code' : code }, { 'elements.code' : elementCode } ]},
          f:  { "code":1, "symbol":1, "treaty":1, "body":1, "session":1, "decision":1, "meeting":1, "title":1, "elements.code":1, "elements.section":1, "elements.paragraph":1, "elements.item":1, "elements.subitem":1, "elements.text":1 },
          l:1
      }
    }

    const res = await this.api.getDecisions(options);
    
    if(!res || res.length === 0) return {url: code};

    const decision = res[0];
    decision.url = '/decisions/'+decision.body.toLowerCase()+'/'+decision.session+'/'+decision.decision;
    decision.elements = _.filter(decision.elements || [], { code: elementCode });

    if(decision.elements[0]) {
        var el = decision.elements[0];
        decision.url += '/'+(el.section||'')+el.paragraph
    }

    return decision;
}

function isUrl(text) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i.test(text||'');
}
</script>