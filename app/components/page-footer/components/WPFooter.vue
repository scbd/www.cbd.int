<template>
  <script type='application/json+ld' v-html='getJsonLd($props)'></script>
</template>
<script>

export default {
  name : 'WPFooter',
  props: [ 'siteNavElms', 'opts' ],
  methods: { getJsonLd }
}

function getJsonLd({ siteNavElms, opts }){
  const { host, basePath } = opts

  return {
    '@context' : 'https://schema.org',
    '@type'    : 'WPFooter',
    '@id'      : `${host}${basePath}#pageFooter`,
    cssSelector: '#pageFooter',
    xpath      : '//*[@id="pageFooter"]',
    hasPart    : siteNavElms
  }
}

</script>