<template>
  <div>
    <element :data-type="dataType" :class="isSelected && 'selected'">
        <div v-if="editor">
            <ckeditor v-model="editorHtml" :editor="editorType" :config="editorConfig"></ckeditor>
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
          :selectedNode.sync="selectedNode"
          :comments="comments"
          :token-reader="tokenReader"
          @addNode="$emit('addNode', $event)"
      />
    </element>
    <div v-if="isSelected || (selectedNode && node.parentId === selectedNode)">
      <button class="btn btn-sm btn-primary w-100 border-bottom-0 rounded-5 p-0 add-button" 
        @click="addNode(node.parentId, node._id)">+</button>
    </div>
  </div>
</template>

<script>
import DecisionApi from '~/api/decisions.js';
import lstring from '~/filters/lstring.js';
import ClassicEditor from 'ckeditor5';
import { component as ckeditor } from 'vue-ckeditor5'
export default {
    name: 'EditElement',
    components : { ckeditor },
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
    data() {
      return {
        editorType: ClassicEditor,
        editor: false,
        editorHtml: '',
        api: {}
      }
    },
    computed: {
      editorConfig() {
          return {
              toolbar: [ 'bold', 'italic'],
              language: {
                  ui: 'en', // The UI will be English.
                  content: this.locale
              }
          };
      },
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

          return node._id === selectedNode;
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
    created
}

function addNode(parentId, nextTo) {
  const params = {
    parentId, 
    nextTo: nextTo || '000000000000000000000000',
    html: null
  }
  this.$emit('addNode', params);
}

function created() {
  this.api = new DecisionApi(this.tokenReader);
}

function toggleSelected() {
  const {node, isSelected} = this;
  this.$emit("update:selectedNode", isSelected ? null: node._id);
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

