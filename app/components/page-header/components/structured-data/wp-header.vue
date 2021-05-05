<template >
  <script type='application/json+ld' v-html='getJsonLd($props)'></script>
</template>
<script>

export default {
  name : 'WPHeader',
  props  : [ 'siteNavElms', 'opts' ],
  methods: { getJsonLd }
}


function getJsonLd({ siteNavElms, opts }){
  const { basePath, host }    = opts

  return {
    '@context' : 'https://schema.org',
    '@type'    : 'WPHeader',
    '@id'      : `${host}${basePath}#pageSubHeader`,
    cssSelector: '#pageSubHeader',
    xpath      : '//*[@id="pageSubHeader"]',
    hasPart    : siteNavElms
  }
}

</script>