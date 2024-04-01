<template>
<div>
    <div class="pointer" @click.stop="setSelectedNode" :class="{ selected: isSelected }">
        <div class="row paragraph" :class="{ dimmed }">
            <div class="col-12">
                <a :name="name"><small></small></a>
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
                        :href="`/decisions/${node.body}/${node.session}/${node.decision}`">
                        <i class="fa fa-search" aria-hidden="true"></i> 
                        {{node.symbol || 'TODO'}}
                    </a>
                    <a class="btn btn-primary btn-sm" role="button" 
                        :href="`/decisions/${node.body}/${node.session}/${node.decision}/${node.section | lowercase}${node.paragraph}${node.item && ('.'+node.item)}`" 
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
        <div class="row" v-if="htmlText" :class="{ dimmed, 'match-filter':isMatchFilter }">
            <div class="col-12" style="padding-bottom:10px">
                <span v-html="htmlText" :lang="locale" />
            </div>
        </div>

        <view-element 
            v-for="child in node.nodes" 
            v-show="child && child._id"
            :key="child._id"
            :node="child"
            :filters.sync="filters" 
            :selectedNode="selectedNode"
            :locale="locale" 
            @update:filters="$emit('update:filters', $event)"
            @update:selectedNode="$emit('update:selectedNode', $event)"
        />
    </div>

</div>
</template>

<script>
import actors from '~/views/decisions/data/actors.js';
import romans from '~/views/decisions/data/romans.js';
import statuses from '~/views/decisions/data/statuses.js';
import _ from 'lodash';
import lstring from '~/filters/lstring.js';
import { sanitizeHtml } from '~/services/html';

export default {
    name: 'ViewElement',
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
        },
        selectedNode: {
            type: String,
            default: null
        },
        locale: {
            type: String,
            default: 'en'
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

            return this.$options.filters.lowercase(node.type);
        },
        dimmed() {
            if(this.hasFilter    && !this.isMatchFilter) return true;
            if(this.selectedNode && !this.isSelected)    return true;
            return false;
        },
        isSelected () {
            const { node, selectedNode } = this;

            if(!selectedNode) return false;

            let selected = false;

            selected = selected || node.code && selectedNode && node.code.indexOf(selectedNode)==0;

            return selected;
        },
        isMatchFilter() {

            const { node, filters } = this;

            if(!filters || Object.keys(filters).length === 0) return false;

            let match = true;

            const {actors, statuses, types, aichiTargets, subjects} = filters;

            if(match && actors) match = _(actors).intersection(node.actors).some();
            if(match && statuses) match = _(statuses).intersection(node.statuses).some();
            if(match && types) match = _(types).intersection([node.type]).some();
            if(match && aichiTargets) match = _(aichiTargets).intersection(node.aichiTargets).some();
            if(match && subjects) match = _(subjects).intersection(node.subjects).some();

            return match;
        },
        hasFilter() {

            const { filters } = this;

            return !_.isEmpty(filters);
        },
        htmlText() {
            const {node, locale} = this;
            const html = this.$options.filters.lstring(node.html, locale);
            
            return sanitizeHtml(html);
        }
    },
    methods: {
        actorName,
        statusName,
        setSelectedNode
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

function setSelectedNode() {
    const {isSelected, node} = this;

    const updatedNode = isSelected ? null : node?.code;

    this.$emit("update:selectedNode", updatedNode);
}
</script>

<style scoped>
.dimmed {
    opacity: 0.30
}

.selected {
    background-color: #baeaf8;
    padding: 5px;
    margin-bottom: 5px;
    border: 1px solid blue;
    border-radius: 4px;
}

.match-filter {
    font-weight: bold;
}

.pointer {
    cursor: pointer; 
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