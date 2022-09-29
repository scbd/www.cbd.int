<template>
  <ul class="navbar-nav">
    <li  @mouseover="open()" @mouseleave="close()" @click="toggle()"  class="nav-item dropdown">

      <a href="#" class="nav-link dropdown-toggle text-uppercase"  role="button" >
        {{getLocaleText()}} <span class="flag-icon"></span>
      </a>

      <transition name="slide-fade">
        <div v-if="show" class="dropdown-menu dropdown-menu-right show">
          <div  class="dropdown-item-container">
            <span v-for="locale in unLocales" :key="locale" >
              <a  @click="setUnLocale(locale)" v-if="locale !== getUnLocale()"  href="#"  class="dropdown-item" :hreflang="locale">              
                <span class="flag-icon"></span>
                <div class="language-option text-uppercase">{{getLocaleText(locale)}}</div>
              </a>
            </span>
          </div>
        </div>
      </transition>
    </li>
  </ul>
</template>

<script>
import   NuxtSSRScreenSize              from 'nuxt-ssr-screen-size'
import { unLocales, unLangMap, getUnLocale, setUnLocale } from '~/services/i18n'

export default {
  name      : 'LangNav',
  mixins    : [ NuxtSSRScreenSize.NuxtSSRScreenSizeMixin ],
  methods   : { toggle, open, close, setState, getLocaleText, getUnLocale, setUnLocale },
  computed  : { isMobile },
  data
}

function data(){ 
  return {
    unLangMap, unLocales,
    show: false
  } 
}

function getLocaleText(locale){
  const selectedLocale = getUnLocale()

  return unLangMap[locale || selectedLocale]
}

function isMobile(){ return this.$vssWidth < 990 }

function toggle(){
  this.show = !this.show
  this.$forceUpdate()
}

function open (){ this.setState(true) }

function close (){ this.setState(false) }

function setState (state){
  if(this.isMobile) return
  
  this.show = state
}
</script>

<style scoped>
  a { color: white; } 
  .nav-item{ text-transform: capitalize; }
  .dropdown-item svg { margin-right:1em; }
  .login {text-transform: uppercase;}
  .di{ color: #ffffff !important; }
  .flag-icon {
    background-image: url(https://cdn.cbd.int/@scbd/www-css@0.0.17/dist/images/icon_language_neg.png);
    background-repeat: no-repeat;
    height: 12px;
    width: 12px;
    display: inline-block;
    background-size: 11px 12px;
    margin-left: 4px;
}
</style>