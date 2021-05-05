<template >
    <div class="desktop-only">
      <nav id="pageMainNav" class="navbar navbar-expand-lg sub-nav">
        <div class="limited-width-content">
          <Logo/>
          <MainNav v-bind="$props"/>
        </div>
      </nav>
    </div>
</template>

<script>
import Logo    from './Logo.vue'
import MainNav from './main-nav.vue'

export default {
  name       : 'SubHeader',
  components : { Logo, MainNav },
  props      : [ 'siteNavElms', 'opts' ]
}
</script>