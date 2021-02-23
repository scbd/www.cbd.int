<template >
  <div>
    <div v-for="{filename, url, text, _id } in files" :key="_id">
      <a class="filename" :href="url" target="_blank">{{filename}}</a>
      <div v-if=" text" class="text-muted small summary">{{text.substr(0,350)}}</div>
    </div>
  </div>

</template>


<script>

export default {
  name      : 'FilesPreview',
  props     : { 
    files: { type: Array,  required: false },
  }
}

</script>

<style scoped>
.filename {
  color:inherit;
  font-weight: bold;
  word-break:break-word;
}
.summary { 
  max-height:40px;
  overflow:hidden;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  block-overflow: ellipsis;
  max-lines: 2;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;  
}
</style>