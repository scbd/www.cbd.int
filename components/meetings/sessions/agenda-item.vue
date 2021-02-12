
<template >
  <span v-if="item " class="badge label agenda" :class="[styleClass]">{{name? $t(name) : ''}} {{item}} </span>
</template>


<script>
import i18n from '../locales.js'

export default {
  name: 'AgendaItem',
  props:{
    meetingName: { type: String, required: false }, 
    meeting: { type: String, required: false },
    item   : { type: Number, required: true }
  },
  computed:{ name, styleClass },
  i18n
}

function name(){
  if(this.meetingName) return this.meetingName
  if(!this?.meeting) return ''

  if(this?.meeting.toLowerCase().includes('cbd')) return 'CBD'
  if(this?.meeting.toLowerCase().includes('cp')) return 'CP'
  if(this?.meeting.toLowerCase().includes('np')) return 'NP'
  if(this?.meeting.toLowerCase().includes('SBSTTA')) return 'SBSTTA'
  return ''
}

function styleClass(){
  if(this.meetingName) return 'CBD'

  if(this.name.toLowerCase().includes('cp')) return 'CP'
  if(this.name.toLowerCase().includes('np')) return 'NP'

  return 'CBD'
}
</script>

<style scoped>
.label.agenda.CBD {
    color: #fff;
    background: #009B48;
}

.label.agenda.CBD {
    color: #fff;
    background: #009B48;
}
.label.agenda.CP {
    color: #fff;
    background: #A05800;
}

.label.agenda.CP {
    color: #fff;
    background: #A05800;
}
.label.agenda.NP {
    color: #fff;
    background: #0086B7;
}
.label.agenda.NP {
    color: #fff;
    background: #0086B7;
}
.label.agenda {
    color: #fff;
    background: #777;
    display: inline-block;
    min-width: 55px;
}
.label.agenda {
    color: #fff;
    background: #777;
    display: inline-block;
    min-width: 55px;
}
.badge {
    display: inline-block;
    padding: .25em .4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25rem;
}
</style>