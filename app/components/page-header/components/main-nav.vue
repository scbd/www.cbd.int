<template >
  <ul class="navbar-nav ml-auto main-nav">
    <li v-for="(aMenu,index) in $props.siteNavElms.hasPart" :key="index" class="nav-item  main-menu-item">
      <a  :href="aMenu.url" :id="makeSelector(aMenu, 'WPH-SNE')" :title="aMenu.name" class="nav-link" role="button" >
        {{aMenu.name}}
      </a>
    </li>
  </ul>
</template>

<script>
import makeSelector from '../components/makeSelector'

export default {
  name      : 'MainNavSH',
  props     : {
    siteNavElms: { type: Array, required: true },
    opts       : { type: Object, required: true }
  },
  methods: { makeSelector } 
}
</script>