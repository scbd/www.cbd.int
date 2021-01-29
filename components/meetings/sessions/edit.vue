
<template >
  <div>
    <h1>Sessions Edit</h1>
    <Accordion :length="sessionsLength">

      <template v-for="(session, index) in sessions"  v-slot:[`header-${index}`]="">
        Date {{index}} 
      </template>

      <template v-for="(session, index) in sessions"  v-slot:[`body-${index}`]="">
        body{{index}}
      </template>

    </Accordion >
  </div>
</template>


<script>
import i18n from '../locales.js'
import Accordion from './accordion.vue'

export default {
  name: 'SessionsEdit',
  components:{ Accordion },
  computed:{ sessionsLength },
  i18n,
  mounted,
  data
}

function data(){
  return { sessions: [{},{},{}] }
}

function sessionsLength(){
  return this.sessions.length
}

function mounted(){
  console.log('edit' )

}
</script>

<style scoped>

</style>