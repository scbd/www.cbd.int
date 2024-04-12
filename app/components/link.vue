
<template>
<span class="dropdown">
  <a v-if="$slots.default" :href="link" :target="target">
    <slot name="default"></slot>
  </a>
  <i ref="copy" @click.stop.prevent="copy()" data-togglex="dropdown" class="cursor-pointer fa" :class="{ 'fa-link' : !isExternal, 'fa-external-link': isExternal }"></i>
</span>
</template>

<script>

import $ from 'jquery';
import copyToClipboard from 'copy-to-clipboard';

const tooltip_CopyTo = 'Copy link to clipboard...';
const tooltip_Copied = 'Link copied to clipboard!';

export default {
  name      : 'link',
  props     : {
    link : { type: String, required: true },
    target: { type: String, default: '_self'}
  },
  data() { return {
    tooltip: tooltip_CopyTo
  }},
  computed: {
    absolutLink() {

      let { link } = this;

      if(!isAbsolutLink(link)) {
        const url      = new URL(window.location.href);
        const realtive = new URL(`http://dummy/${trimLeadingSlash(link)}`);

        url.pathname = realtive.pathname
        url.search   = realtive.search
        url.hash     = realtive.hash

        link = url.href;
      }

      return link;
    },
    isExternal() {
      const baseUrl = new URL(window.location.href);
      const linkUrl = new URL(this.absolutLink);

      return baseUrl.hostname != linkUrl.hostname;
    }
  },
  mounted() {
    $(this.$refs.copy).tooltip({ title: ()=>this.tooltip });
  },
  methods: {
    copy() { 
      const { absolutLink }  = this;
      copyToClipboard(absolutLink);

      this.tooltip = tooltip_Copied;

      $(this.$refs.copy).tooltip('show');

      this.tooltip = tooltip_CopyTo;
    }
  }
}

const schemeRe = /^[a-z+]+:\/\//i;
const pathRe   = /^\//;

function isAbsolutLink(link) {


  try {

    if( pathRe  .test(link)) return false;
    if(!schemeRe.test(link)) return false;

    const url = new URL(link);

    return !!url;
  }
  catch(e) {
    // this point is reacjed is cannot parse url;
  }

  return false
}

function trimLeadingSlash(text) {
  return text.replace(/^\/+/g, '');
}

</script>

<style scoped>

a:hover { text-decoration: none !important;}
.cursor-pointer { cursor: pointer; }

</style>