<template >
  <header id="pageHeaderFixed" ref="pageHeaderFixed" class="header" role="banner" :aria-label="$t('Page Header')">
    <WPHeader v-bind="{ siteNavElms, opts }"/>

    <Icons />

    <Desktop  v-show="!isMobile" v-bind="{ siteNavElms, opts, me }"/>
    <Mobile   v-show="isMobile"  v-bind="{ siteNavElms, opts, me }"/>

  </header>
</template>

<script>
import NuxtSSRScreenSize   from 'nuxt-ssr-screen-size'
import i18n                from './locales/index.mjs'
import { debounce  } from 'lodash'
import WPHeader            from './components/structured-data/WPHeader.vue'
import Icons               from './components/Icons.vue'
import Mobile              from './components/mobile/index.vue'
import Desktop             from './components/desktop/index.vue'
import defaultOptions from './default-options'
import $axios from 'axios'

const anonUser = { userID: 1, name: 'anonymous', email: 'anonymous@domain', government: null, userGroups: null, isAuthenticated: false, isOffline: true, roles: [] }

export default {
  name      : 'PageHeaderFixed',
  mixins    : [ NuxtSSRScreenSize.NuxtSSRScreenSizeMixin ],
  components: { WPHeader, Icons, Mobile, Desktop },
  computed  : { opts, isMobile },
  methods   : { readMenusFromApi, getTopMenu, getMain },
  props     : { 
    options: { type: Object, default: () => {} },
    me: { type: Object, default: () => anonUser },
    signOut:  { type: Function }
  },
  mounted, data, created, i18n
}

function created(){
  if(!this.opts.static)
    setTimeout(() => this.readMenusFromApi(), 100)
}

async function readMenusFromApi(){
  this.mainSNEs    = (await this.getMain(this.opts))[0]
  this.siteNavElms = (await this.getTopMenu(this.opts))
}

function data(){ return { siteNavElms: [], mainSNEs: {} } }

function opts(){

  const defaultOpts = { ...defaultOptions, ... this.options,    signOut: this.signOut }

  defaultOpts.siteNavElms = this.siteNavElms.length? this.siteNavElms : defaultOpts.siteNavElms
  defaultOpts.mainSNEs    = Object.keys(this.mainSNEs).length? this.mainSNEs : defaultOpts.mainSNEs

  return defaultOpts
}

function isMobile(){
  return this.$vssWidth < 990
}

function mounted(){
  const self = this

  this.$nextTick(() => window.addEventListener('resize', () => debounce(() => self.$forceUpdate(), 500)))
}

function getMain({ dapi }){
  return $axios.get(`${dapi}/menus/main?postfix=WPHF`)
    .then(({ data }) => data)
    .then((d) =>  [ { identifier: [ { name: 'drupalMenuName', value: 'main' } ], name: 'main', position: 3, hasPart: d } ])
}

function getTopMenu({ dapi }){
  return $axios.get(`${dapi}/menus/topmenu?postfix=WPHF`).then(({ data }) => data)
}

</script>

<style>
  .slide-fade-enter-active { transition:  all .1s ease; }
  .slide-fade-enter, .slide-fade-leave-to { transform: translateY(-20px); opacity  : 0; }
</style>
<style scoped>
#pageHeaderFixed{  width: 100vw; z-index: 3;  }
</style>