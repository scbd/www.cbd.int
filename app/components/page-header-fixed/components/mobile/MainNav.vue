<template>
  <ul class="navbar-nav ml-auto main-nav" style="margin-bottom:-1rem;">
    <li v-for="(aMenu,index) in siteNavElms.hasPart" :key="index" class="nav-item  main-menu-item">
      <a  :href="'https://www.cbd.int'+aMenu.url" :id="$options.makeSelector(aMenu, 'WPH-SNE')" :title="aMenu.name" class="nav-link di" role="button" >
        {{aMenu.name}}
      </a>
    </li>
  </ul>
</template>

<script>
import makeSelector from '../makeSelector'

export default {
  props: { siteNavElms: { type: Object, required: true } },
  makeSelector
}
</script>

<style scoped>
  @media screen and (max-width: 768px) { .sub-nav .main-nav{ min-height: unset;} }
  .di{ color: #ffffff !important; }
</style>