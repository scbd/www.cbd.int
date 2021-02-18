
<template >
  <section v-if="length">
    <div v-for="i in size" :key="i" class="card">

      <div @click.stop="toggle(i)" class="card-header" >
        <h5 class="mb-0 position-relative" >
            <slot :name="`header-${i}`"/>
            <i  class="carret fa fa-caret-up fa-2x" :class="{'open': visible[i]}"/>
        </h5>
        
      </div>

      <transition  name="body" @enter="start" @after-enter="end" @before-leave="start" @after-leave="end">
        <div v-show="visible[i]" id="collapseOne" class="collapse show">
          <div class="card-body px-0">
            <slot :name="`body-${i}`"/>
          </div>
        </div>
      </transition>

    </div>
  </section>
</template>


<script>
  import { cloneDeep } from 'lodash'

  export default {
    name    : 'Accordion',
    props   : { length: { type: Number, required: false, default: 0 }, },
    computed: { size },
    methods : { toggle, start, end, initVisibleFlags },
    mounted, data
  }

  function data(){ return { visible: [false] } }

  function mounted(){
    this.initVisibleFlags()
  }

  function toggle(index) {
    this.initVisibleFlags()

    this.visible[index] = !this.visible[index]
    this.visible        = cloneDeep(this.visible) // reactivity
  }

  function initVisibleFlags(){
    if(this.visible.length !== this.length)
      this.visible = new Array(this.length).fill(false)
  }

  function start( { style, scrollHeight }) { style.height = `${scrollHeight}px` }

  function end({ style }) { style.height = '' }

  function size(){ return [ ...Array(this.length).keys() ] }
</script>

<style >
  .fa-caret-up{
    transform: rotate(0deg);
    transition: all 0.75s 0.25s;
  }

  .fa-caret-up.open{
    transform: rotate(180deg);
    transition: all 0.75s 0.25s;
  }
</style>

<style scoped>
  .carret { position:absolute; left: 50%; top: -8px; }

  h5 { color: #009b48;}
  
  .card { border:none }
  .card-header { cursor  : pointer; }
  .item        { position: relative; } 
  .start       { display : flex; }

  .body-enter-active,
  .body-leave-active {
    will-change: height, opacity;
    transition: height 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
  }

  .body-enter,
  .body-leave-to {
    height: 0 !important;
    opacity: 0;
  }
</style>