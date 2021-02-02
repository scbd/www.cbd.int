
<template >
  <section>
    <button type="button" class="btn btn-default btn-lg dropdown-toggle">
      <i class="fa fa-arrow-circle-down" style="font-size:1.25em"/>
    </button>

    
  </section>
</template>


<script>
export default {
  name: 'FilesView',
  props:{
    files: { type: String, required: false }, 
  },
  computed:{ name, styleClass },
  i18n
}

</script>

<style scoped>

</style>