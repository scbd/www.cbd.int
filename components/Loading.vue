
<template>
<div class="loading">
  <div class="cont mx-auto">
    <div class="ring">
      <Spinner :size="40" color="#009b48">
        <div class="text-cont">
          <img class="leaf" src="https://attachments.cbd.int/cbd-leaf-green.svg" ><br>
          <span class="percent" v-if="percent"> {{percent}}%</span>
        </div>
      </Spinner>
    </div>
  </div>
</div>
</template>

<script>
import Spinner from './Spinner.vue'

export default {
  name      : 'Loading',
  components: { Spinner },
  props     : [ 'percent' ]
}
</script>

<style scoped>
.loading{ min-height: 3em; }
.cont{position: relative; height: 45px; width: 47px; }
.ring{ position: absolute;   top: 50%; left: 50%; transform: translate(-50%, -50%);}
.percent{ font-size: 1.5em; font-weight: bold; color: #009b48; display: inline-block; }
.leaf{margin-left: .25em;max-height:35px;}

</style>