<template >
  <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <symbol id="icon-sign-out" viewBox="0 0 25 28">
        <title>{{$t('Sign Out')}}</title>
        <path d="M10 22.5c0 0.438 0.203 1.5-0.5 1.5h-5c-2.484 0-4.5-2.016-4.5-4.5v-11c0-2.484 2.016-4.5 4.5-4.5h5c0.266 0 0.5 0.234 0.5 0.5 0 0.438 0.203 1.5-0.5 1.5h-5c-1.375 0-2.5 1.125-2.5 2.5v11c0 1.375 1.125 2.5 2.5 2.5h4.5c0.391 0 1-0.078 1 0.5zM24.5 14c0 0.266-0.109 0.516-0.297 0.703l-8.5 8.5c-0.187 0.187-0.438 0.297-0.703 0.297-0.547 0-1-0.453-1-1v-4.5h-7c-0.547 0-1-0.453-1-1v-6c0-0.547 0.453-1 1-1h7v-4.5c0-0.547 0.453-1 1-1 0.266 0 0.516 0.109 0.703 0.297l8.5 8.5c0.187 0.187 0.297 0.438 0.297 0.703z"></path>
      </symbol>
      <symbol id="icon-profile" viewBox="0 0 20 28">
        <title>{{$t('Profile')}}</title>
        <path d="M20 21.859c0 2.281-1.5 4.141-3.328 4.141h-13.344c-1.828 0-3.328-1.859-3.328-4.141 0-4.109 1.016-8.859 5.109-8.859 1.266 1.234 2.984 2 4.891 2s3.625-0.766 4.891-2c4.094 0 5.109 4.75 5.109 8.859zM16 8c0 3.313-2.688 6-6 6s-6-2.688-6-6 2.688-6 6-6 6 2.688 6 6z"></path>
      </symbol>
      <symbol id="icon-password" viewBox="0 0 18 28">
        <title>{{$t('Password')}}</title>
        <path d="M5 12h8v-3c0-2.203-1.797-4-4-4s-4 1.797-4 4v3zM18 13.5v9c0 0.828-0.672 1.5-1.5 1.5h-15c-0.828 0-1.5-0.672-1.5-1.5v-9c0-0.828 0.672-1.5 1.5-1.5h0.5v-3c0-3.844 3.156-7 7-7s7 3.156 7 7v3h0.5c0.828 0 1.5 0.672 1.5 1.5z"></path>
      </symbol>
      <symbol id="icon-lock" viewBox="0 0 32 32">
        <title>{{$t('Lock')}}</title>
        <path d="M15 21.915v0c-0.583-0.206-1-0.762-1-1.415 0-0.828 0.672-1.5 1.5-1.5s1.5 0.672 1.5 1.5c0 0.653-0.417 1.209-1 1.415v2.594c0 0.263-0.224 0.491-0.5 0.491-0.268 0-0.5-0.22-0.5-0.491v-2.594zM8 14v0 0c-1.658 0.005-3 1.34-3 3.009v9.981c0 1.662 1.346 3.009 3.009 3.009h14.982c1.662 0 3.009-1.337 3.009-3.009v-9.981c0-1.659-1.341-3.005-3-3.009v-3.501c0-4.142-3.366-7.499-7.5-7.499-4.142 0-7.5 3.357-7.5 7.499v3.501zM11 14v-3.499c0-2.492 2.015-4.501 4.5-4.501 2.48 0 4.5 2.015 4.5 4.501v3.499h-9z"></path>
      </symbol>
      <symbol id="icon-search" viewBox="0 0 250 270" preserveAspectRatio="xMidYMid meet">
        <title>{{$t('Search')}}</title>
        <path d="M16 254 c-20 -20 -20 -22 5 -63 14 -24 19 -44 15 -63 -7 -37 15 -90 45 -112 13 -9 43 -16 67 -16 62 0 102 40 102 104 0 64 -40 109 -100 112 -31 1 -49 9 -67 28 -27 30 -45 33 -67 10z m164 -104 c36 -36 14 -100 -34 -100 -60 1 -81 79 -29 109 26 15 41 13 63 -9z"/>
      </symbol>
      <symbol id="icon-menu" viewBox="0 0 24 24">
      <title>{{$t('Menu')}}</title>
      <path d="M-1.77635684e-15,-8.8817842e-16 L29.461538,-8.8817842e-16 L29.461538,2 L-1.77635684e-15,2 L-1.77635684e-15,-8.8817842e-16 Z M4.91025633,10.6407675 L4.91025633,9.64076753 L29.461538,9.64076753 L29.461538,10.6407675 L4.91025633,10.6407675 Z M-1.77635684e-15,20.2777774 L-1.77635684e-15,18.2777774 L29.461538,18.2777774 L29.461538,20.2777774 L-1.77635684e-15,20.2777774 Z"></path>
      </symbol>
      <symbol id="icon-close" viewBox="0 0 30 30">
      <title>{{$t('Close')}}</title>
      <path  d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z"></path>
      </symbol>
      <filter id="blur" x="0" y="0">
        <feGaussianBlur in="SourceGraphic" stdDeviation=".5" />
      </filter>
    </defs>
  </svg>
</template>

<script>
import i18n         from '../locales/index.mjs'
export default {
  name : 'IconsWPH', i18n 
}
</script>
<style>
.icon {
  display     : inline-block;
  width       : 1em;
  height      : 1em;
  stroke-width: 0;
  stroke      : currentColor;
  fill        : currentColor;
}
.icon-sign-out { width: 0.875em; }
.icon-profile  { width: 0.7138671875em; }
.icon-lock     { width: 0.8em; margin-bottom: .25em}
.icon-search { width: 1em; fill:#ffffff;}
.icon-menu { width: 1.6em; fill:#ffffff}
.icon-close { font-size: 1.5em; fill:#ffffff}
</style>