<template >
  <script type='application/json+ld' v-html='getJsonLd($props)'></script>
</template>
<script>

export default {
  name   : 'WPHeader',
  props  : [ 'siteNavElms', 'opts' ],
  methods: { getJsonLd }
}

function  getPotentialAction({ accountsUrl, searchUrl, host }){
  return [
    {
      '@context': 'https://schema.org',
      '@type'   : 'Action',
      name      : 'Login',
      targe     : `${accountsUrl}/signin`
    },
    {
      '@context'   : 'https://schema.org',
      '@type'      : 'SearchAction',
      target       : `${searchUrl}{query}`,
      query        : 'required',
      'query-input': 'required name = query',
      url          : host
    }
  ]
}

function getJsonLd({ siteNavElms, opts }){
  const { basePath, host }    = opts
  const potentialAction = getPotentialAction(opts)

  return {
    '@context' : 'https://schema.org',
    '@type'    : 'WPHeader',
    '@id'      : `${host}${basePath}#pageHeader`,
    cssSelector: '#pageHeader',
    xpath      : '//*[@id="pageHeader"]',
    hasPart    : siteNavElms,
    potentialAction
  }
}

</script>