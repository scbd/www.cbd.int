
<template >
  <section>
    <div v-for="i in size" :key="i" class="card">

      <div @click.stop="open(i)" class="card-header" >
        <h5 class="mb-0" >
            <slot :name="`header-${i}`"/>
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
  export default {
    name    : 'Accordion',
    props   : { length: { type: Number, required: false, default: 1 }, },
    computed: {size},
    methods : { open, start, end },
    mounted, data
  }

  function data(){ return { visible: [true] } }

  function mounted(){
    this.visible = new Array(this.length).fill(false)
    this.visible[0] = true
  }

  function open(index) {
    const isOpen = this.visible[index]

    this.visible = new Array(this.length).fill(false)

    if(!isOpen) this.visible[index] = true
    else if(this.visible[index+1] !== undefined) this.visible[index+1] = true
    else if(this.visible[index-1] !== undefined) this.visible[index-1] = true
  }

  function start( { style, scrollHeight }) { style.height = `${scrollHeight}px` }

  function end({ style }) { style.height = '' }

  function size(){ return [ ...Array(this.length).keys() ] }
</script>

<style scoped>
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