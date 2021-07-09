<template>
<div>
    <div :class="dimmed && 'dimmed'">
        <div class="row">
            <div class="col-12">
                <a :name="name"></a>
                <span v-if="type" class="pull-right badge" style="opacity:0.5;margin-right:6px"
                    :class="type === 'operational' ? 'badge-info' : 'badge-secondary'">
                    <span>
                        <span v-if="type === 'operational'"><i class="fa fa-cog"></i> Operational</span>
                        <span v-else-if="type === 'informational'"><i class="fa fa-info-circle"></i> Informational</span>
                        <span v-else>{{node.type | uppercase}}</span>
                    </span>
                </span>

                <span 
                    v-for="status in node.statuses" 
                    :key="status"
                    class="pull-right badge" 
                    :class="status === 'active' ? 'badge-success' : 'badge-secondary'"
                    style="opacity:0.5;margin-right:6px"
                >
                    <i class="fa fa-info-circle"></i>
                    <span>{{statusName(status)}}</span>
                </span>

                <span 
                    v-for="actor in node.actors" 
                    :key="actor"
                    class="pull-right badge badge-secondary" 
                    style="opacity:0.5;margin-right:6px"
                >
                    <i class="fa fa-user" aria-hidden="true"></i>
                    <span>{{actorName(actor)}}</span>
                </span>

                <p v-if="node.type==='paragraph'">
                    <a class="btn btn-primary btn-sm" role="button" v-if="showDecision"
                        :href="`/decisions/cop/${node.session}/${node.decision}`">
                        <i class="fa fa-search" aria-hidden="true"></i> 
                        UNEP/CBD/COP/DEC/{{romans[node.session]}}/{{node.decision}}
                    </a>
                    <a class="btn btn-primary btn-sm" role="button" 
                        :href="`/decisions/cop/${node.session}/${node.decision}/${node.section | lowercase}${node.paragraph}${node.item && ('.'+node.item)}`" 
                        @click="$root.hiddenHash='view'"
                    >
                        <i class="fa fa-search" aria-hidden="true"></i> 
                        paragraph 
                        <span v-if="node.section">{{node.section}}.</span> 
                        {{node.paragraph}} 
                        <span v-if="node.item">item ({{node.item}})</span>
                    </a>
                </p>
            </div>
        </div>
        <div class="row" v-if="node.html">
            <div class="col-12">
                <span v-html="node.html.en" />
            </div>
        </div>
    </div>
    <view-element 
        v-for="child in node.nodes" 
        :key="child._id"
        :node="child"
        :filters.sync="filters"
    />
</div>
</template>

<script>
import actors from '~/views/decisions/data/actors.js';
import romans from '~/views/decisions/data/romans.js';
import statuses from '~/views/decisions/data/statuses.js';
import _ from 'lodash';

export default {
    name: 'ViewElement',
    filters: {
        uppercase(text) {
            return (text + '').toUpperCase();
        },
        lowercase(text) {
            return (text + '').toLowerCase()
        }
    },
    props: {
        node: {
            type: Object,
            default: () => {}
        },
        showDecision: {
            type: Boolean,
            default: false
        },
        filters: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        actors() { return actors},
        statuses() { return statuses},
        romans() { return romans},
        name() {
            const { node } = this;

            if(!node.code) return '';

            return node.code.split('/').join('-');
        },
        type() {
            const { node }= this;

            if(!node.type) return '';

            if(node.type === 'information') node.type = 'informational';

            return this.$options.filters.lowercase(node.type);
        },
        dimmed() {
            const { node, filters } = this;

            if(!filters || Object.keys(filters).length === 0) return false;

            const {actors, statuses, types, aichiTargets, subjects} = filters;

            if(types && _(types).intersection([node.type]).some()) return false;
            if(statuses && _(statuses).intersection(node.statuses).some()) return false;
            if(actors && _(actors).intersection(node.actors).some()) return false;
            if(aichiTargets && _(aichiTargets).intersection(node.aichiTargets).some()) return false;
            if(subjects && _(subjects).intersection(node.subjects).some()) return false;

            return true;
        }
    },
    methods: {
        actorName,
        statusName
    }
}

function actorName(text) {
    const lowerText = this.$options.filters.lowercase(text);
    return actors.find(a => a.code === lowerText)?.title 
    || this.$options.filters.uppercase(text);
}

function statusName(text) {
    const lowerText = this.$options.filters.lowercase(text);
    return statuses.find(s => s.code === lowerText)?.title 
        || this.$options.filters.uppercase(text);
}
</script>

<style scoped>
.dimmed {
    opacity: 0.5
}
</style>