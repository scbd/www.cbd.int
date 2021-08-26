<template>
  <div>
    <element :data-type="dataType" :class="isSelected && 'selected'">
        <div class="action-buttons row" :class="dataType?'absolute':'relative'">
          <button 
            v-if="node.code" 
            class="btn btn-link action-button comment" 
            :class="nodeComments.length > 0 && 'has-comments'"
          >
            <span class="fa fa-comments-o" @click="$emit('edit-comment', node)" />
            <span class="fa fa-comment-o" @click="$emit('edit-comment', node)"/>
          </button>
          <button class="btn btn-link action-button edit" @click="edit">
            <span class="fa fa-edit" />
          </button>
          <button v-if="!node.nodes || node.nodes.length === 0" class="btn btn-link action-button delete" @click="deleteNode">
            <span class="fa fa-trash" />
          </button>
        </div>
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
        <div v-if="allowAddNodes && isSelected">
          <button class="btn btn-sm btn-primary w-100 border-bottom-0 rounded-5 p-0 add-button" 
            @click="addNode(node._id, null)">+</button>
        </div>
        <edit-element 
          v-for="child in node.nodes" 
          v-show="child && child._id"
          :key="child._id"
          :decisionId="decisionId"
          :node="child"
          :selected-node.sync="selectedNode"
          :comments="comments"
          :token-reader="tokenReader"
          :allow-add-nodes="allowAddNodes"
          @change="$emit('change', $event)"
          @update:selected-node="$emit('update:selected-node', $event)"
          @edit-comment="$emit('edit-comment', $event)"
      />
    </element>
    <div v-if="allowAddNodes && (isSelected || (selectedNode && node.parentId === selectedNode._id))">
      <button class="btn btn-sm btn-primary w-100 border-bottom-0 rounded-5 p-0 add-button" 
        @click="addNode(node.parentId, node._id)">+</button>
    </div>
  </div>
</template>

<script>
import DecisionApi from '~/api/decisions.js';
import lstring from '~/filters/lstring.js';
import TextEditor, {EditorTypes} from '~/components/text-editor.vue';
import sectionList from '~/views/decisions/data/sections.js';
import paragraphList from '~/views/decisions/data/paragraphes.js';
import itemList from '~/views/decisions/data/items.js';
import subItemList from '~/views/decisions/data/sub-items.js';

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
      decisionId: {
        type: String,
        default: '',
      },
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
      allowAddNodes: {
        type: Boolean,
        default: false
      }
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
        const {section, paragraph, item, subitem} = node;
        if(subitem)   return `paragraph ${label('section',section)} ${label('paragraph',paragraph)}${label('item',item)} (${label('subitem',subitem)})`;
        if(item)      return `paragraph ${label('section',section)} ${label('paragraph',paragraph)}${label('item',item)}`;
        if(paragraph) return `paragraph ${label('section',section)} ${label('paragraph',paragraph)}`;
        if(section)   return `section ${label('section',section)}`;
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
      },
      nodeComments() {
        const {node, comments} = this;

        return comments[node.code] || [];
      }
    },
    methods: {
      toggleSelected,
      edit,
      save,
      cancel,
      addNode,
      label,
      deleteNode
    },
    mounted: load
}

function label(type, value) {
  if(!value) return '';

  let list = [];
  if(type === 'section') list = sectionList;
  else if(type === 'paragraph') list = paragraphList;
  else if(type === 'item') list = itemList;
  else if(type === 'subitem') list = subItemList;
  
  return (list.find(e => e.value === value) || {}).code || value;
}

function load() {
  this.api = new DecisionApi(this.tokenReader);
}

async function addNode(parentId, nextTo) {
  const params = {
    parentId, 
    nextTo: nextTo || '000000000000000000000000',
    html: null
  }

  await this.api.addNodeToDecisionTree(this.decisionId, params);
  this.$emit('change');
}

function toggleSelected() {
  const {node, isSelected} = this;
  this.$emit("update:selected-node", isSelected ? null: node);
}

function edit() {
  this.editor = true;
  this.editorHtml = this.htmlText;
}

async function deleteNode() {
  //TODO - delete
  const { node } = this;

  const { _id, decisionId } = node;

  await this.api.deleteDecisionNode(decisionId, _id);

  this.$emit('change');
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

