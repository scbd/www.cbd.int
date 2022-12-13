<template>
  <div  v-if="isVisible">
    <div v-if="youTubeLinks.length" class="position-relative m-1" :class="{'dropleft': this.position==='left', 'dropright': this.position==='right' }">
      <a class="btn btn-dark dropdown-toggle" :class="{'btn-xs':size=='xs'}" href="javascript:void(0)" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Watch <i class="fa fa-video-camera"></i>
      </a>

      <div ref="youtube" class="dropdown-menu dropdown-menu-right" x-placement="left-start" >
        <a  :href="url" v-for="{ url, locale } in youTubeLinks" :key="url" target="video" class="fix dropdown-item text-nowrap"><i aria-hidden="true" class="fa fa-play-circle"></i> {{locale | langText}}</a>
      </div>
    </div>

    <div v-if="nonYouTubeLinks.length" class="position-relative m-1"  :class="{'dropleft': this.position==='left', 'dropright': this.position==='right' }">
      <a class="btn btn-info dropdown-toggle" href="javascript:void(0)" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Links <i ref="caret" class="fa fa-caret-down"></i>
      </a>

      <div ref="links" class="dropdown-menu dropdown-menu-right" x-placement="left-start" >
        <a :href="url" v-for="{ url, name, locale } in nonYouTubeLinks" :key="url" target="video" class="fix dropdown-item text-nowrap"><i aria-hidden="true" class="fa fa-link"></i> 
          {{name}} 
          <span v-if="locale">({{locale | langText}})</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import * as ResService from '~/services/reservation'
  import langsMap        from '../languages'

  export default {
    name      : 'ReservationLinks',
    props     : {
                  reservation: { type: Object, required: true },
                  schedule   : { type: Object, required: true },
                  size       : { type: String, required: false },
                  position   : { type: String, default: ''}
                },
    computed  : { isVisible, youTubeLinks, nonYouTubeLinks, displayLinksImmediately },
    methods   : { refresher, clearRefresher },
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