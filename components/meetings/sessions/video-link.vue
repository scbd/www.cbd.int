<template >
  <span v-if="entries.length">

    <!-- Single Video -->
    <a v-if="entries.length==1" :href="entries[0].url" class="btn btn-link">
      <i class="fa fa-play-circle" aria-hidden="true"></i>
    </a>

    <!-- Mutiple Videos -->
    <div v-if="entries.length>1" class="btn-group dropleft" role="group">
      <button type="button" class="btn btn-link dropdown-toggle" data-toggle="dropdown">
        <i class="fa fa-play-circle" aria-hidden="true"></i>
      </button>
      <div class="dropdown-menu">
        <a class="fix dropdown-item text-nowrap" :href="url" v-for="{ language, url } in entries" :key="url" target="video">
          <i class="fa fa-play-circle" aria-hidden="true"></i> {{language | languageName }}
        </a>
      </div>
    </div>    
  </span>
</template>


<script>

import { Duration } from 'luxon'
import { asDateTime } from '../filters.js'
import languages from '../../languages.js'

const Types = { 
  youtube : { param : "t", format: "s" }
}

export default {
  name      : 'VideoLink',
  props     : { 
    videos  : { type: Array,         required: true, default:[] },
    startAt : { type: [String,Date], required: false },
  },
  filters : { languageName: (l)=>languages[l] || l },
  computed: {
    entries
  }
}

function entries() {
  if(!this.startAt) return this.videos.filter(o=>!!o.url);

  const seekable = this.videos.filter(o=>canSeek(o));

  return seekable.map(v=>({...v, url : seekedUrl(v, this.startAt) }));
}

function canSeek(entry) {
  const { startDate, type } = entry
  return !!startDate && !!Types[type];
}

function seekedUrl(v, startAt) {
  const { startDate }     = v;
  const { param, format } = Types[v.type];

  const seconds = delayInSecondes(startDate, startAt)

  const seekTo  = Duration.fromObject({ seconds }).toFormat(format);
  const url     = new URL(v.url);

  url.searchParams.set(param, seekTo);

  return url.toString();
}

export function delayInSecondes(from, to) {

  from = asDateTime(from);
  to   = asDateTime(to);

  const diff =  to.diff(from, 'seconds');

  return Math.abs(diff.seconds);
}
</script>

<style scoped>
.dropleft > .dropdown-toggle::before {
  content:none;
}
.btn-link {
  color: inherit;
}
.summary { 
  max-height:40px;
  overflow:hidden;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  block-overflow: ellipsis;
  max-lines: 2;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;  
}

</style>

<style >
@media (max-width: 991px){
  .fix.dropdown-item {
      font-size: 1rem !important;
      white-space: normal;
  }
}
</style>