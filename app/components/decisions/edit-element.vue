<template>
  <div>
    <element :data-type="dataType" :class="isSelected && 'selected'">
        <div v-if="editor">
            <text-editor :html.sync="editorHtml" :locale="locale" :type="EditorTypes.Full" />
            <div class="text-right">
                <span class="btn text-success" @click="save(row)"><i class="fa fa-check"></i></span>
                <span class="btn text-danger" @click="cancel(row)"><i class="fa fa-times"></i></span>
            </div>
        </div>
        <div v-else @click="toggleSelected">
          <!-- TODO - remove nbsp; -->
          &nbsp;<span v-html="htmlText" />
        </div>
        <button class="btn btn-link comment">
          <!-- TODO - fa-comments icon -->
          <span class="fa fa-comment-o" />
        </button>
        <button class="btn btn-link edit" @click="edit">
          <span class="fa fa-edit" />
        </button>
        <div v-if="isSelected">
          <button class="btn btn-sm btn-primary w-100 border-bottom-0 rounded-5 p-0 add-button" 
            @click="addNode(node._id, null)">+</button>
        </div>
        <edit-element 
          v-for="child in node.nodes" 
          v-show="child && child._id"
          :key="child._id"
          :node="child"
          :selected-node.sync="selectedNode"
          :comments="comments"
          :token-reader="tokenReader"
          @addNode="$emit('addNode', $event)"
          @update:selected-node="$emit('update:selected-node', $event)"
      />
    </element>
    <div v-if="isSelected || (selectedNode && node.parentId === selectedNode._id)">
      <button class="btn btn-sm btn-primary w-100 border-bottom-0 rounded-5 p-0 add-button" 
        @click="addNode(node.parentId, node._id)">+</button>
    </div>
  </div>
</template>

<script>
import DecisionApi from '~/api/decisions.js';
import lstring from '~/filters/lstring.js';
import TextEditor, {EditorTypes} from '~/components/text-editor.vue';

export default {
    name: 'EditElement',
    components : { TextEditor },
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
      tokenReader: { type: Function, required: false },
      node: {
        type: Object,
        default: () => {}
      },
      selectedNode: {
        type: Object,
        default: () => {}
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
    data() {
      return {
        editor: false,
        editorHtml: '',
        api: {}
      }
    },
    computed: {
      EditorTypes() {return EditorTypes;},
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

          if(!(node || {})._id) return false;

          return node._id === selectedNode._id;
      },
      htmlText() {
          const {node} = this;
          
          return this.$options.filters.lstring(node.html, 'en');
      }
    },
    methods: {
      toggleSelected,
      edit,
      save,
      cancel,
      addNode
    },
    mounted: load
}

function load() {
  this.api = new DecisionApi(this.tokenReader);
  if(this.node && this.node.paragraph) {
    this.node.type = 'paragraph';
  }
}

function addNode(parentId, nextTo) {
  const params = {
    parentId, 
    nextTo: nextTo || '000000000000000000000000',
    html: null
  }
  this.$emit('addNode', params);
}

function toggleSelected() {
  const {node, isSelected} = this;
  this.$emit("update:selected-node", isSelected ? null: node);
}

function edit() {
  this.editor = true;
  this.editorHtml = this.htmlText;
}

async function save() {
  const {node, editorHtml, locale} = this;

  const { decisionId } = node
  
  const result = await this.api.updateDecisionNodeText(decisionId, node._id, locale, editorHtml );
  
  node.html = result;
  this.editor = false;
  this.editorHtml = '';
}

function cancel() {
  this.editor = false;
  this.editorHtml = '';
}
</script>

