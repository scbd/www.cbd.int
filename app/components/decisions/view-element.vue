<template>
    <div>
        <a :name="node.data.code.split('/').join('-')"></a>
        <span v-if="type" class="pull-right badge" style="opacity:0.5;margin-right:6px"
            :class="type === 'operational' ? 'badge-info' : 'badge-secondary'">
            <span>
                <span v-if="type === 'operational'"><i class="fa fa-cog"></i> operational</span>
                <span v-else-if="type === 'informational'"><i class="fa fa-info-circle"></i> informational</span>
                <span v-else>{{node.data.type | uppercase}}</span>
            </span>
	    </span>

        <span 
            v-for="status in node.data.statuses" 
            :key="status"
            class="pull-right badge" 
            :class="status === 'active' ? 'badge-success' : 'badge-secondary'"
            style="opacity:0.5;margin-right:6px"
        >
            <i class="fa fa-info-circle"></i>
            <span>{{statusName(status)}}</span>
        </span>

        <span 
            v-for="actor in node.data.actors" 
            :key="actor"
            class="pull-right badge badge-secondary" 
            style="opacity:0.5;margin-right:6px"
        >
            <i class="fa fa-user" aria-hidden="true"></i>
            <span>{{actorName(actor)}}</span>
        </span>

        <p v-if="node.type==='paragraph'">
            <a class="btn btn-primary btn-sm" role="button" v-if="showDecision"
                :href="`/decisions/cop/${node.data.session}/${node.data.decision}`">
                <i class="fa fa-search" aria-hidden="true"></i> 
                UNEP/CBD/COP/DEC/{{romans[node.data.session]}}/{{node.data.decision}}
            </a>
            <a class="btn btn-primary btn-sm" role="button" 
                :href="`/decisions/cop/${node.data.session}/${node.data.decision}/${node.data.section | lowercase}${node.paragraph}${node.item && ('.'+node.item)}`" 
                @click="$root.hiddenHash='view'"
            >
                <i class="fa fa-search" aria-hidden="true"></i> 
                paragraph 
                <span v-if="node.data.section">{{node.data.section}}.</span> 
                {{node.paragraph}} 
                <span v-if="node.item">item ({{node.item}})</span>
            </a>
        </p>

        <div><span v-html="node.html" /></div>
    </div>
</template>

<script>
import actors from '~/views/decisions/data/actors.js';
import romans from '~/views/decisions/data/romans.js';
import statuses from '~/views/decisions/data/statuses.js';

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
        }
    },
    computed: {
        actors() { return actors},
        statuses() { return statuses},
        romans() { return romans},
        type() {
            let dataType = this.node.data.type;

            if(!dataType) return '';

            if(dataType === 'information') dataType = 'informational';

            return this.$options.filters.lowercase(this.node.data.type);
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