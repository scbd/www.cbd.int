
<template >
  <span>
    <span v-if="item" class="badge label agenda" :class="[item.prefix]" :style="{ 'background-color': item.color }" :title="item.title">
      <span v-if="showPrefix">{{$t(item.prefix)}}</span> {{item.code||item.item}}
    </span>
    <span v-if="showCaption" :title="item.title">
      {{item.shortTitle || item.title}}
    </span>
  </span>
</template>

<script>
import i18n from '../locales.js'

export default {
  name : 'AgendaItem',
  props: { 
    item :       { type: Object,  required: true } ,
    showCaption: { type: Boolean, default:false }, 
    showPrefix:  { type: Boolean, default:true } 
  },
  i18n
}
</script>
