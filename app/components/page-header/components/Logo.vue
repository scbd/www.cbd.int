<template >
  <a class="navbar-brand" href="/" :title="$t('Convention on Biological Diversity')">
    <img id="scbdLogo" :src="`https://attachments.cbd.int/${$i18n.locale}/CBD_logo_green.png`" :alt="$t('Convention on Biological Diversity')">
  </a>
</template>
<script>
import i18n from '../locales/index.js'

export default {
  name : 'LogoPH', i18n
}
</script>