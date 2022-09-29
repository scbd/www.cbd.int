<template >
  <nav id="pageFixedNav" class="navbar navbar-expand-lg top-nav desktop-only">
    <div class="limited-width-content">

      <div class="navbar-collapse">
        <TopMenuDropDown v-bind="$props"/>
      
        <LangNav />
        <LoginNav v-bind="$props"/>

        <div id="block-topsearchblock" class="block-top-search-block" >
          <SearchNav v-bind="$props"/>
        </div>
      </div>

    </div>
  </nav>
</template>

<script>
import i18n            from '../../locales/index.mjs'
import TopMenuDropDown from '../TopMenuDropDown.vue'
import SearchNav       from '../SearchNav.vue'
import LoginNav        from '../LoginNav.vue'
import LangNav        from '../LanguageNav.vue'

export default {
  props     : {
    siteNavElms: { type: Array, required: true },
    opts       : { type: Object, required: true },
    me         : { type: Object, required: true }
  },
  components: { TopMenuDropDown, SearchNav, LoginNav, LangNav },
  i18n
}
</script>