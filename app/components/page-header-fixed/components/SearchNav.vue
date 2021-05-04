<template>
  <div class="search-nav views-exposed-form bef-exposed-form"  >
    <div class="row form-row">
      <fieldset class="form-item-query form-group col-auto">
        <label for="globalSearch">{{$t('Search')}}</label>
        <input v-model="query" :placeholder="$t('Search')" :id="`globalSearch${isMobile}`" class="form-autocomplete form-text form-control ui-autocomplete-input" type="text"/>

      </fieldset>
      <div @click="search()" class="input-group-prepend p-0">
          <span class="input-group-text" id="inputGroupPrepend">
            <Icon name="search" />
          </span>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue'
import i18n from '../locales/index.mjs'

export default {
  name : 'SearchNav',
  props: {
    siteNavElms: { type: Array, required: true },
    opts       : { type: Object, required: true },
    isMobile   : { type: String, default: 'Descktop' }
  },
  components: { Icon },
  methods   : { search },
  data, i18n
}

function data(){ return { query: '' } }

function search(){ window.location.href=`${this.opts.searchUrl}${this.query}` }
</script>

<style scoped>
.form-row{position: relative;}
.search-nav{ margin-left: 1em; }
.input-group-text{ background-color: #003a2e; border: none; }
.input-group-text img { width:67%; fill: #ffffff;}
input.form-autocomplete{ background-image: none !important; }

@media screen and (max-width: 990px) {
  .search-nav{ margin-left: 0; }
  .form-text{ width:100% !important; display: inline-block;}
  .input-group-prepend{ position: absolute; right:25px; top:5px; }
}
</style>