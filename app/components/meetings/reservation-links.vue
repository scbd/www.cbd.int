<template>
  <div  v-if="isVisible">
    <div v-if="youTubeLinks.length" class="position-relative"  @focusout="clickYoutube($event)">
      <a @click="clickYoutube()" class="badge badge-dark dropdown-toggle" href="javascript:void(0)" aria-haspopup="true" aria-expanded="false">
        Watch <i class="fa fa-video-camera"></i>
      </a>

      <div ref="youtube" :class="{'drop-left': this.position==='left', 'drop-right': this.position!=='left'}" class="dropdown-menu drop" x-placement="left-start" >
        <a  :href="url" v-for="{ url, locale } in youTubeLinks" :key="url" target="video" class="fix dropdown-item text-nowrap"><i aria-hidden="true" class="fa fa-play-circle"></i> {{locale | langText}}</a>
      </div>
    </div>

    <div v-if="nonYouTubeLinks.length" class="position-relative"  @focusout="clickLinks($event)">
      <a @click="clickLinks()" class="badge badge-info dropdown-toggle" href="javascript:void(0)" aria-haspopup="true" aria-expanded="false">
        Links <i ref="caret" class="fa fa-caret-down"></i>
      </a>

      <div ref="links" :class="{'drop-left': this.position==='left', 'drop-right': this.position!=='left'}" class="dropdown-menu drop" x-placement="left-start" >
        <a :href="url" v-for="{ url, name } in nonYouTubeLinks" :key="url" target="video" class="fix dropdown-item text-nowrap"><i aria-hidden="true" class="fa fa-link"></i> {{name}}</a>
      </div>
    </div>
  </div>
</template>

<script>
  import * as ResService from '~/services/reservation'

  const langsMap = { ar:'العربية', en: 'English',  es: 'Español', fr: 'Français', ru:'Русский', zh:'中文' }

  export default {
    name      : 'ReservationLinks',
    props     : {
                  reservation: { type: Object, required: true },
                  schedule   : { type: Object, required: true },
                  position   : { type: String, default: 'left'}
                },
    computed  : { isVisible, youTubeLinks, nonYouTubeLinks, displayLinksImmediately },
    methods   : { clickYoutube, clickLinks, refresher, clearRefresher },
    filters   : { langText },
    data, created, mounted, beforeDestroy
  }

  /*****************/
  /* vue life cycle
  /****************/
  function data () { 
    return { refresherInterval: undefined } 
  }
  
  function created(){ this.refresher() }

  function mounted(){ 
    if(!displayLinksImmediately)
      this.refresherInterval = setInterval(this.refresher, 30000)
  }

  function beforeDestroy (){ this.clearRefresher() }

  /*****************/
  /* vue methods
  /****************/
  function clickYoutube(e){
    const { youtube } = this.$refs

    if(e?.relatedTarget) return setTimeout(() => youtube.classList.toggle('show'), 500)

    youtube.classList.toggle('show')
  }

  function clickLinks(e){
    const { links, caret } = this.$refs

    if(e?.relatedTarget) return setTimeout(() => links.classList.toggle('show'), 500)

    links.classList.toggle('show')

    caret.classList.toggle('fa-caret-down')
    caret.classList.toggle('fa-caret-up')
  }

  function refresher(){
    const { displayLinksImmediately } = this.reservation

    if(displayLinksImmediately) return

    this.isConnectionDone = ResService.isConnectionDone(this.reservation, this.schedule)
  }

  function clearRefresher(){
    if(this.refresherInterval) clearInterval(this.refresherInterval)
  }

  /*****************/
  /* vue computed
  /****************/

  function displayLinksImmediately(){
    const { displayLinksImmediately } = this.reservation

    return displayLinksImmediately
  }

  function youTubeLinks(){
    const { links } = this.reservation

    if(!links || !links.length) return []

    return links.filter(({ url, name } = { url: '', name: '' })=> url.startsWith('https://yout') || name.toLowerCase().includes('youtube'))
  }

  function nonYouTubeLinks(){
    const { links } = this.reservation

    if(!links || !links.length) return []

    return links.filter(({ url, name } = { url: '', name: '' })=> !url.startsWith('https://yout') && !name.toLowerCase().includes('youtube'))
  }

  function isVisible(){
    const { displayLinksImmediately } = this.reservation

    return displayLinksImmediately || this.isConnectionDone
  }

  /*****************/
  /* vue filtered
  /****************/
  function langText(code){ return langsMap[code] }

</script>

<style scoped>
  .drop { position: absolute; transform: translate3d(-140px, 0px, 0px); top: 0px; left: 0px; will-change: transform; }
  .drop-left { transform: translate3d(-140px, 0px, 0px); }
  .drop-right{ transform: translate3d(80px, 0px, 0px); }
</style>