
<template >
  <div class="modal fade" ref="dialog" tabindex="-1" role="dialog" aria-labelledby="aiDisclaimerModalLabel" aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title" id="aiDisclaimerModalLabel">{{ $t('aiTranslationDisclaimer') }}</h5>

          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ $t('aiDisclaimerText') }}</p>
        </div>
        <div class="modal-footer">
          <a class="btn btn-primary" :href="file.url" target="_blank" @click="close()">{{ $t('download') }}</a>
          <button type="button" class="btn" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Vue from 'Vue';
import i18n from '../locales.js';

const DisclaimerDialog = {
  name    :  'DisclaimerDialog',
  props   : {
              file: { type: Object,  required: true  },
              show: { type: Boolean, required: false, default: false }
            },
  methods: { open, close },
  watch:   { show: open },
  mounted,
  i18n,
}

function open(visible) {
  const dialog = $(this.$refs.dialog);

  if(visible) {
    dialog.modal('show');
  }
  else {
    dialog.modal('hide');
  }
}

function close() {
  this.open(false);
}

function mounted() {

  $(this.$refs.dialog).on('hidden.bs.modal', ()=> this.$emit('close') );

  if(this.show)
    this.open(true);
}

export default DisclaimerDialog;

export function showDisclaimer(file) {

  const Dialog = Vue.extend(DisclaimerDialog);

  const vm = new Dialog({
    propsData: { file, show:true }
  });

  vm.$once('close', ()=> {
    vm.$destroy();
    $(vm.$el).remove()
  });

  const mountingPoint = $("<div></div>");

  $("body").append(mountingPoint);

  vm.$mount(mountingPoint[0])
}

</script>

<style scoped>
.modal-content,
.modal-content h5,
.modal-content p {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: normal;
}
</style>
