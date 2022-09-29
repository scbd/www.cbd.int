<i18n src="./locales/index.json"></i18n>
<template >
  <header id="pageSubHeader" class="header" role="banner" :aria-label="$t('Page Sub Header')">
    <WPHeader  v-bind="{ siteNavElms, opts }"/>
    <SubHeader v-bind="{ siteNavElms, opts }"/>
  </header>
</template>

<script>
import $axios              from 'axios'
import WPHeader            from './components/structured-data/wp-header.vue'
import SubHeader           from './components/sub-header.vue'
import defaultOptions from './default-options'

export default {
  name      : 'PageSubHeader',
  components: { WPHeader, SubHeader },
  methods   : { readMenusFromApi },
  computed  : { opts, siteNavElms },
  props     : { options: { type: Object, default: () => {} } },
  created, data
}

function created(){
  if(!this.opts.static)
    setTimeout(() => this.readMenusFromApi(), 100)
}

function data(){ return { siteNavigationElement: {} } }

function opts(){
  return { ...defaultOptions, ...this.options } 
}

function siteNavElms(){
  return Object.keys(this.siteNavigationElement||{}).length? this.siteNavigationElement : this.opts.siteNavigationElement
}

async function readMenusFromApi(){
  this.siteNavigationElement = (await getMain(this.opts))[0]
}

function getMain({ dapi }){
  return $axios.get(`${dapi}/menus/main?postfix=WPSH`)
    .then(({ data }) => data)
    .then((d) =>  [ { identifier: [ { name: 'drupalMenuName', value: 'main' } ], name: 'main', position: 3, hasPart: d } ])
}
</script>

<style scoped>
#pageSubHeader{  width: 100vw; z-index: 2; background-color: white; }
</style>