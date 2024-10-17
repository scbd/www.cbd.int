<template>
  <div  v-if="isVisible">
    <div v-if="videoLinks.length" class="position-relative m-1" :class="{'dropleft': this.position==='left', 'dropright': this.position==='right' }">
      <a class="btn btn-dark" 
        :class="{'dropdown-toggle':!defaultVideoUrl,'btn-xs':size=='xs'}" 
        :href="defaultVideoUrl||'#'" 
        :data-toggle="!defaultVideoUrl ? 'dropdown' : null" 
        target="video"
        aria-haspopup="true" 
        aria-expanded="false"
      >
        Watch <i class="fa fa-video-camera"></i>
      </a>

      <div ref="youtube" class="dropdown-menu dropdown-menu-right" x-placement="left-start" >
        <a  :href="link.url" v-for="link in videoLinks" :key="link.url" target="video" class="fix dropdown-item text-nowrap">
          <span v-if="link.isYoutube" :title="`Youtube - ${link.name}`">
            <i aria-hidden="true" class="fa fa-youtube-play" style="color: red;"></i> {{link.locale | langText}}
          </span>
          <span v-else-if="link.isUnWebTv" title="UN Web TV">
            <i aria-hidden="true" class="fa fa-play-circle" style="color:#5b92e5"></i> UN Web TV
          </span>
          <span v-else>
            <i aria-hidden="true" class="fa fa-play-circle"></i> {{ link.name }}
          </span>
        </a>
      </div>
    </div>

    <div v-if="nonVideoLinks.length" class="position-relative m-1"  :class="{'dropleft': this.position==='left', 'dropright': this.position==='right' }">
      <a class="btn btn-info dropdown-toggle" href="javascript:void(0)" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Links <i ref="caret" class="fa fa-caret-down"></i>
      </a>

      <div ref="links" class="dropdown-menu dropdown-menu-right" x-placement="left-start" >
        <a :href="url" v-for="{ url, name, locale } in nonVideoLinks" :key="url" target="video" class="fix dropdown-item text-nowrap"><i aria-hidden="true" class="fa fa-link"></i> 
          {{name}} 
          <span v-if="locale">({{locale | langText}})</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import * as ResService from '~/services/reservation'
  import { getLanguageName } from '~/data/languages'
  import _ from 'lodash';

  export default {
    name      : 'ReservationLinks',
    props     : {
                  reservation: { type: Object, required: true },
                  schedule   : { type: Object, required: true },
                  size       : { type: String, required: false },
                  position   : { type: String, default: ''}
                },
    computed  : { isVisible, defaultVideoUrl, videoLinks, nonVideoLinks, displayLinksImmediately },
    methods   : { refresher, clearRefresher },
    filters   : { langText: getLanguageName },
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

  function defaultVideoUrl() {
    let links = this.videoLinks || [];
    return links[0]?.url;
  }

  function videoLinks(){
    let links = this.reservation?.links || [];

    links = links.filter(l=>isVideoLink(l)).map(l =>({
      ...l,
      isYoutube : isYoutube(l.url),
      isUnWebTv : isUnWebTv(l.url)
    }));

    return _.sortBy(links, buildSortKey);
  }

  function nonVideoLinks(){
    let links = this.reservation?.links || [];

    links = links.filter(l=>!isVideoLink(l)).map(l =>({ ...l }));

    return _.sortBy(links, buildSortKey);
  }

  function isVideoLink(link) {
    const { url, name } = link;
    return isYoutube(url) || isUnWebTv(url)
  }

  function isYoutube(url) {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url||'');
  }

  function isUnWebTv(url) {
    return /^https?:\/\/webtv.un.org\//.test(url||'');
  }

  function buildSortKey(link) {

    const { isYoutube, isUnWebTv, name, locale } = link;

    return `${isUnWebTv ? 0 : 1}-${isYoutube ? 0 : 1}-${locale || 'zz'}-${name}`.toLowerCase();
  } 

  function isVisible(){
    const { displayLinksImmediately } = this.reservation

    return displayLinksImmediately || this.isConnectionDone
  }

</script>