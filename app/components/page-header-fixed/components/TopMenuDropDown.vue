<template>
  <ul class="navbar-nav mr-auto">
    <li @mouseover.passive="open(index)" @mouseleave="close(index)" v-on:click.capture="toggle(index)" v-for="(aMenu,index) in opts.siteNavElms" :key="index" :id="makeSelector(aMenu, 'SNE')" class="topmenu nav-item dropdown">
      <a href="#" :title="aMenu.name" class="nav-link dropdown-toggle di"  role="button" >
        {{aMenu.name}}
      </a>

      <transition name="slide-fade">
        <div v-if="hideShows[index]"  class="dropdown-menu show">
          <div class="dropdown-item-container">
            <a v-for="(aSubMenu, index) in aMenu.hasPart" :key="index" :href="'https://www.cbd.int'+aSubMenu.url" :title="aSubMenu.name" :id="makeSelector(aSubMenu, 'SNE')" class="dropdown-item di">
              <span class="dropdown-item-label">{{aSubMenu.name}}</span>
            </a>
          </div>
        </div>
      </transition>
    </li>
  </ul>
</template>

<script>
import NuxtSSRScreenSize from 'nuxt-ssr-screen-size'
import { debounce } from 'lodash'
import makeSelector from './makeSelector'

export default {
  name    : 'TopMenuDropDown',
  mixins  : [ NuxtSSRScreenSize.NuxtSSRScreenSizeMixin ],
  props   : [ 'opts' ],
  computed: { isMobile },
  methods : { toggle, open, close, initState, set, makeSelector },
  data,
  mounted
}

function data(){
  const hideShows  = []
  const init       = false

  return { hideShows, init }
}

function mounted(){
  this.initState()
}

function isMobile(){
  return this.$vssWidth < 990
}

function initState(){
  if(!Array.isArray(this.siteNavElms)) return

  const length = this.siteNavElms.length

  if(!length) return

  for (let i = 0; i < length; i++)
    this.hideShows[i] = false
}

function toggle(index){
  if(!this.isMobile) return
  this.hideShows[index] = !this.hideShows[index]
  this.$forceUpdate()
}

function open (index){ debounce( () => this.set(index, true), 1000) }

function close (index){ debounce(() => this.set(index, false), 1000) }

function set (index, state){
  if(this.isMobile) return
  this.hideShows[index] = state
  this.$forceUpdate()
}
</script>
<style scoped>
.di{ color: #ffffff !important; }
</style>