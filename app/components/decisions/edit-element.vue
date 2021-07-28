<template>
  <div>
    <element :data-type="dataType" @click="toggleSelected" :class="isSelected && 'selected'">
      <span v-html="htmlText" />
      <button class="btn btn-link comment">
        <span class="fa" :class="comments && (node || {}).code && comments[node.code] ? 'fa-comments-o':'fa-comments-o'"></span>
      </button>
      <edit-element 
        v-for="child in node.nodes" 
        v-show="child && child._id"
        :key="child._id"
        :node="child"
        :selectedNode.sync="selectedNode"
        :comments="comments"
    />
    </element>
  </div>
</template>

<script>
import lstring from '~/filters/lstring.js';
export default {
    name: 'EditElement',
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
      selectedNode: {
        type: String,
        default: null
      },
      comments: {
        type: Object,
        default: () => {}
      },
      locale: {
        type: String,
        default: 'en'
      },
    },
    computed: {
      dataType() {
        const {node} = this;
        if(node.subitem)   return `paragraph ${node.paragraph} ${node.item} (${node.subitem})`;
        if(node.item)      return `paragraph ${node.paragraph} ${node.item}`;
        if(node.paragraph) return `paragraph ${node.paragraph}`;
        if(node.section)   return `section ${node.section}`;
        return null;
      },
      isSelected() {
          const { node, selectedNode } = this;

          if(!selectedNode) return false;

          let selected = false;

          selected = selected || node.code && selectedNode && selected && node.code.indexOf(selectedNode)==0;

          return selected;
      },
      htmlText() {
          const {node} = this;
          
          return this.$options.filters.lstring(node.html, 'en');
      }
    },
    methods: {
      toggleSelected
    }
}

function toggleSelected() {
  const {node, isSelected} = this;
  this.$emit("update:selectedNode", isSelected ? null: node.code);
}
</script>

