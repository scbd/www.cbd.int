<template>
  <div v-show="show" class="mobile-nav-wrapper ml-auto mobile-menu" style="min-width:88vw;">
      <div  class="navbar-collapse" style="width:100%">

        <hr >
        <div class="mobile-top-menu">
          <MainNav :siteNavElms="opts.mainSNEs"/>

          <LoginNav v-bind="$props" />

          <SearchNav v-bind="$props" is-mobile="Mobile"/>

        </div>
      </div>

  </div>
</template>

<script>
import TopMenuDropDown from '../TopMenuDropDown.vue'
import LoginNav        from '../LoginNav.vue'
import SearchNav       from '../SearchNav.vue'
import MainNav         from './MainNav.vue'

export default {
  name      : 'MobileNav',
  components: { TopMenuDropDown, LoginNav, SearchNav, MainNav },
  props     : {
    siteNavElms: { type: Array, required: true },
    opts       : { type: Object, required: true },
    show       : { type: Boolean, default: false },
        me         : { type: Object, required: true }
  }
}


</script>

<style scoped>
.mobi-name{
  font-size: 18px;
  color: #ffffff !important;
  word-break: break-word;
}
</style>