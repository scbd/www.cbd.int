<template >
  <nav :id="$props.menu['@id']" :class="$props.classes" style="margin-bottom:2em;">
    <h4 class="h4 text-uppercase"> {{$props.menu.name}} </h4>
    <hr class="pf-hr">
    <nav :class="{['flex-two-column']:$props.flexCol==2 && !isMobile}" class="footer-block">
      <a :id="aMenu['@id']" v-for="(aMenu,index) in $props.menu.hasPart" :key="index"  :href="aMenu.url" :title="aMenu.name" class="pf-a">
        <span v-if="!aMenu.image" class="pf-as"> {{aMenu.name}} </span>
        <figure v-if="aMenu.image" class="pf-f">
          <img :class="{'uno-brand':aMenu.image.includes('un-logo'), 'uno-environment':aMenu.image.includes('UNEP') }" :srcset="aMenu.image" :alt="aMenu.name" >
        </figure>
      </a>
    </nav>
  </nav>
</template>

<script>
import NuxtSSRScreenSize from 'nuxt-ssr-screen-size'

export default {
  name     : 'PageFooterNav',
  mixins   : [ NuxtSSRScreenSize.NuxtSSRScreenSizeMixin ],
  props    : [ 'menu', 'classes', 'flexCol' ],
  computed : { isMobile }
}

function isMobile(){
  return this.$vssWidth < 990
}
</script>

<style scoped>
.pf-hl{  text-transform: uppercase; font-size: 1.25em; margin: 0 0 0 0; color:#cdcdcd; letter-spacing: 0.4px; line-height: 30px; }
.pf-hr{ border-bottom: 1px solid#cdcdcd; width: 100%; margin: 5px 0; }
.pf-a{ color:#cdcdcd; display: block; font-size: 1em; letter-spacing: 0.4px;}
.pf-as{ color:#cdcdcd; font-size: 1.125rem; letter-spacing: 0.4px;}
.pf-f { margin-top: 1em; }
.uno-environment{ width:160px; height: 160px;}
@media (max-width: 568px){
  .pf-hl{ margin-top: 1em;}
}
</style>

