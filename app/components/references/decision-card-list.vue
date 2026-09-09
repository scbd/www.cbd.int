<template>
    <div>
        <div 
            v-for="(decision, index) in decisionList"
            :key="index"
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
import DecisionApi from '~/api/decisions.js';
import { indexQuery, isIndexMatch } from '~/services/decision-index.js';

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
            decisionList: [],
        }
    },
    created:refresh,
    watch:{
        decisions: refresh
    },
    methods: {
        lookupDecisions,
        lookupIndexedDecisions
    }
}

async function refresh() {

    const codes = this.decisions.filter(c => !!c);

    const decisions = await this.lookupDecisions(codes.filter(c => !isUrl(c)));

    // Map over the codes, not over the results: two references may point at different
    // paragraphs of the same decision.
    const cards = codes.map(code => isUrl(code) ? { code, url: code, elements: null }
                                                : toCard(code, decisions));

    // Only COP decisions live in the decisions collection. Recommendations (SBI, SBSTTA,
    // WG8J...) exist only in the search index, so resolve the leftovers there.
    const indexed = await this.lookupIndexedDecisions(codes.filter((code, i) => !cards[i]));

    // References that resolve in neither store are dropped. Several references can collapse
    // onto one card: an index card has no element data, so every paragraph of a
    // recommendation resolves to its parent.
    this.decisionList = dedupe(cards.map((card, i) => card || toIndexCard(codes[i], indexed))
                                    .filter(card => !!card));

    // References that resolve to nothing are dropped, so the caller cannot tell from the
    // codes alone whether anything will render.
    this.$emit('update:count', this.decisionList.length);
}

async function lookupDecisions(codes) {
    if(!codes || codes.length === 0) return [];

    const elementCodes = codes.map(c => getElementCode(c));

    const params = {
        q : { $or: [ { 'code' : { $in: [...codes] } }, { 'elements.code' : { $in: [ ...elementCodes] } } ]},
        f : { "code":1, "symbol":1, "body":1, "session":1, "decision":1, "title":1,
              "elements.code":1, "elements.section":1, "elements.paragraph":1, "elements.item":1, "elements.subitem":1 }
    };

    const results = await this.decisionapi.getDecisionTexts(params);

    return results || [];
}

async function lookupIndexedDecisions(codes) {

    const q = indexQuery(codes);

    if(!q) return [];

    const params = {
        q,
        fl : 'id,symbol_s,schema_s,body_s,session_i,decision_i,title_*,url_ss,file_ss',
        rows: 999
    };

    const results = await this.decisionapi.queryDecisionDocuments(params);

    return results || [];
}

// Builds the card for one reference code, or null when the reference resolves to no
// decision. `elements` is the single matched element (decision-card.vue reads it as an
// object), not the decision's whole element array.
function toCard(code, decisions) {

    const elementCode = getElementCode(code);

    const decision = decisions.find(d => d.code === code || (d.elements||[]).some(e => e.code === elementCode));

    if(!decision) return null; // nothing to link to and nothing to describe: hide it

    const element = (decision.elements||[]).find(e => e.code === elementCode) || null;

    const url = '/decisions/'+encodeURIComponent(decision.body.toLowerCase())
              + '/'+encodeURIComponent(decision.session)
              + '/'+encodeURIComponent(decision.decision)
              + elementPath(element);

    return { ...decision, elements: element, url };
}

// Builds the card for a reference the decisions collection does not hold. The index has
// no element data, so a paragraph-level reference resolves to its parent decision.
function toIndexCard(code, indexed) {

    const doc = indexed.find(d => isIndexMatch(d, code));

    return doc ? { ...doc, elements: null } : null;
}

function dedupe(cards) {

    const seen = new Set();

    return cards.filter(card => {
        if(seen.has(card.url)) return false;

        seen.add(card.url);

        return true;
    });
}

function elementPath(element) {
    if(!element) return '';

    // Mirrors the tree's node codes: {section}{paragraph}[.{item}[.{subitem}]]
    const path = [`${element.section||''}${element.paragraph||''}`, element.item, element.subitem]
                 .filter(part => part !== null && part !== undefined && part !== '')
                 .join('.');

    return path ? `/${path}` : '';
}

function getElementCode(text) {
    return text.replace(/(\w+\/\w+\/\w+\/\w+)\/(.+)/, '$1.$2');
}

function isUrl(text) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i.test(text||'');
}
</script>
