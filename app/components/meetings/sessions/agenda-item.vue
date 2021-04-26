
<template >
  <span v-if="item " class="badge label agenda" :class="[item.prefix]">
    {{$t(item.prefix)}} {{item.item}} 
  </span>
</template>

<script>
import i18n from '../locales.js'

export default {
  name : 'AgendaItem',
  props: { item : { type: Object, required: true } },
  i18n
}
</script>
