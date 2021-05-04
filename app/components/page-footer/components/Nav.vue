<template >
  <nav :id="$props.menu['@id']" :class="$props.classes">
    <h1 class="pf-hl"> {{$props.menu.name}} </h1>
    <hr class="pf-hr">
    <nav :class="{['flex-two-column']:$props.flexCol==2}" class="footer-block">
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
export default {
  name : 'PageFooterNav',
  props: [ 'menu', 'classes', 'flexCol' ]
}
</script>

<style scoped>
.pf-hl{  text-transform: uppercase; font-size: 1.25em; margin: 0 0 0 0; color:#cdcdcd; letter-spacing: 0.4px; line-height: 30px; }
.pf-hr{ border-bottom: 1px solid#cdcdcd; width: 100%; margin: 5px 0; }
.pf-a{ color:#cdcdcd; display: block; font-size: 1em; letter-spacing: 0.4px;}
.pf-as{ color:#cdcdcd; font-size: 1em; letter-spacing: 0.4px;}
.pf-f { margin-top: 1em; }
.uno-environment{ width:53%; height: 53%; padding-top:1em; padding-left:1em;}
@media (max-width: 568px){
  .pf-hl{ margin-top: 1em;}
}
</style>

