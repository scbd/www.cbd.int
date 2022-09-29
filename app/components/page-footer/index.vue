<i18n src="./locales/index.json"></i18n>
<template>
<section>
  <FollowUs />
  <footer id="pageFooter" class="cbd-footer">

    <WPFooter v-bind="{ opts, siteNavElms }"/>

    <div class="container row">

      <Nav v-if="siteNavElms[0] && siteNavElms[0].hasPart" :menu="siteNavElms[0]" :classes="['col-12','col-lg-4']" :flex-col="2"/>
      <Nav v-if="siteNavElms[1] && siteNavElms[1].hasPart" :menu="siteNavElms[1]" :classes="['col-12','col-lg-4']" :flex-col="1"/>
      <Nav v-if="siteNavElms[2] && siteNavElms[2].hasPart" :menu="siteNavElms[2]" :classes="['col-6','col-lg-2']" />
      <Nav v-if="siteNavElms[3] && siteNavElms[3].hasPart" :menu="siteNavElms[3]" :classes="['col-6','col-lg-2']" />

    </div>
  </footer>
  </section>
</template>

<script>
import Nav            from './components/Nav.vue'
import FollowUs       from './components/FollowUs.vue'
import WPFooter       from './components/WPFooter.vue'
import defaultOptions from './default-options'
import $axios         from 'axios'

export default {
  name      : 'PageFooter',
  components: { Nav, FollowUs, WPFooter },
  computed  : { opts, siteNavElms },
  methods   : { readMenusFromApi },
  props     : {  options: { type: Object, default: () => {} }, },
  data, created
}

function data(){
  const siteNavigationElements  = []

  return { siteNavigationElements }
}

function created(){
  if(!this.opts.static)
    setTimeout(() => this.readMenusFromApi(), 100)
}

function siteNavElms(){
  return (this.siteNavigationElements || []).length? this.siteNavigationElements : this.opts.siteNavigationElements
}

function opts(){
  return { ...defaultOptions, ...this.options }
}

async function readMenusFromApi(){
  this.siteNavigationElement = (await getMain(this.opts))[0]
}

function getMain({ dapi }){
  return $axios.get(`${dapi}/menus?q=quick-links,topics,information,aPartOf`)
    .then(({ data }) => data)
}
</script>

<style scoped>
  footer { background-color: #202020; color: #cdcdcd; padding-bottom: 5em; letter-spacing: .025em; font-size: 16px; }
</style>

