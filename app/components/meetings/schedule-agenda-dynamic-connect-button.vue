<template>
  <div v-if="isVisible">
    <a v-if="!canConnect" :class="{ 'badge': isBadge , 'badge-dark': isBadge, 'btn-dark': !isBadge, 'btn': !isBadge  }" :content="canConnectMsg" v-tippy="{ placement : 'top',  arrow: true, size: 'large', allowHTML: true }" class="not-allowed" href="javascript:void(0)">
      Connect <ScheduleConnectIcon :size="iconSize"/>
    </a>

    <a v-if="canConnect" :href="reservation.videoUrl" :class="{ 'badge': isBadge , 'badge-danger': isBadge, 'btn': !isBadge, 'btn-danger': !isBadge }" class="btn" target="_blank" >
      <div> 
        Connect
        <span v-if="isConnectionTestingInProgress">now</span>
        <ScheduleConnectIcon :size="iconSize"/> 
      </div>
      <div v-if="isInProgress"><small> (Meeting In Progress) </small></div>

      <div v-if="isConnectionTestingInProgress"><small> Meeting will start in </small></div>
      <div v-if="isConnectionTestingInProgress && !isBadge" class="progress-text"><small> {{willStartTimeText}} </small></div>
    </a>
  </div>
</template>

<script>
  import Vue                          from 'vue'
  import VueTippy, { TippyComponent } from 'vue-tippy';
  import * as ResService              from '~/services/reservation'
  import ScheduleConnectIcon          from '~/components/meetings/schedule-connect-icon.vue'

  Vue.use(VueTippy)

  export default {
    name      : 'ScheduleAgendaDynamicConnectButton',
    components: { ScheduleConnectIcon, TippyComponent },
    props     : {  
                  reservation: { type: Object, required: true },
                  schedule   : { type: Object, required: true },
                  isBadge    : { type: Boolean, required: false, default: false },
                },
    computed  : { isDailySchedule, canConnectMsg, isVisible, willStartTimeText, iconSize },
    methods   : { refresher, clearRefresher },
    data, created, mounted, beforeDestroy
  }

  /*****************/
  /* vue life cycle
  /****************/
  function data () { 
    return { 
              refresherInterval            : undefined,
              canConnect                   : false,
              canConnectIn                 : undefined,
              isInProgress                 : false,
              isConnectionTestingInProgress: false,
              isConnectionDone             : false,
              hasConnection                : false,
              willStartDuration            : undefined,
            } 
  }

  function created(){ if(!this.isDailySchedule) this.refresher()  }
  function mounted(){ if(!this.isDailySchedule) this.refresherInterval = setInterval(this.refresher, 30000) }
  function beforeDestroy (){ this.clearRefresher() }


  /*****************/
  /* vue methods
  /****************/
  function refresher(){
    if(this.isDailySchedule) return

    this.isInProgress                  = ResService.isInProgress(this.reservation) && !this.isConnectionTestingInProgress
    this.isConnectionTestingInProgress = ResService.isConnectionTestingInProgress(this.reservation, this.schedule)

    this.canConnect                    = ResService.canConnect(this.reservation, this.schedule)
    this.canConnectIn                  = ResService.getNowToConnectInitDuration (this.reservation, this.schedule)
    this.hasConnection                 = ResService.hasConnection(this.reservation)
    this.isConnectionDone              = ResService.isConnectionDone(this.reservation, this.schedule)
    this.willStartDuration             = ResService.getNowToStartDuration(this.reservation, this.schedule)
  }

  function clearRefresher(){
    if(this.refresherInterval) clearInterval(this.refresherInterval)
  }

  /*****************/
  /* vue computed
  /****************/

  function iconSize(){ return this.isBadge? '18' : '22' }

  function isVisible(){
    return !this.isDailySchedule && this.hasConnection && !this.isConnectionDone
  }

  function isDailySchedule(){
    const { all } = this.schedule
    return !all 
  }

  function canConnectMsg(){
    const { days, hours, minutes } = this.canConnectIn

    const isMultipleHours   = hours   > 1
    const isMultipleMinutes = minutes > 1
    const isMultipleDays    = days    > 1

    const daysText          = isMultipleDays   ? `${days} days`       : `1 day`
    const hoursText         = isMultipleHours  ? `${hours} hours`     : `1 hour`
    const minutesText       = isMultipleMinutes? `${minutes} minutes` : `1 minute`

    const timeText          = days? `${daysText}, ${hoursText} <small class="connect-tip-small">and</small> ${minutesText}` :
                                hours? `${hoursText} <small class="connect-tip-small">and</small> ${minutesText}` : minutesText

    return`<h6 class="connect-tip text-nowrap"> This meeting will be accessible in: </h6> <h4 class="connect-tip text-nowrap"> ${timeText} </h4>`
  }


  function willStartTimeText(){
    const { hours, minutes } = this.willStartDuration

    return `${hours}:${padDigit(minutes)}`
  }

  function padDigit(digit){
    const testDigit = Math.abs(digit)

    if(testDigit>10) return testDigit

    const numberString = testDigit.toString()

    return numberString.padStart(2,'0')
  }
</script>

<style scoped>
  small        { font-size: 10px; }
  .not-allowed { cursor: not-allowed; }
  .progress-text { margin-top: -10px;}
</style>

<style >
  .connect-tip{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
  .connect-tip-small{ font-size:16px; }
</style>