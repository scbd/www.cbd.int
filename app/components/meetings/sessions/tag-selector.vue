<template>
  <span class="dropdown">
    <button class="btn btn-outline-dark btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      <i class="fa fa-list-ul"></i>
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
      <a class="dropdown-item"  v-for="{tag, title, selected } in entries" :key="tag" href="#" @click="$emit('tag', tag)">
        <i class="fa fa-fw" :class="selected && 'fa-check'"></i>
        {{title}}
      </a>
    </div>
  </span>
</template>
<script>

import { union } from 'lodash'
import Tags, { getTitle } from './tags.js'

export default {
  name      : 'TagSelector',
  props     : { 
    selectedTags : { type: Array,  required: false, default:[] },
  },
  computed: {
    entries() {

      const tags = union(Object.keys(Tags), this.selectedTags||[]);

      return tags.map(tag=>({ 
        tag, 
        title: getTitle(tag),
        selected: this.selectedTags.includes(tag)
      }));
    }
  }
}

</script>