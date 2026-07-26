
<template >
  <div class="modal fade" ref="dialog" tabindex="-1" role="dialog" aria-labelledby="aiDisclaimerModalLabel" aria-hidden="true" :dir="dir" :lang="file.language">

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
          <button type="button" class="btn" data-dismiss="modal">{{ $t('close') }}</button>
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
  computed: { dir },
  methods: { open, close },
  watch:   { show: open },
  created,
  mounted,
  i18n,
}

// The disclaimer is about the file being opened, so it reads in that file's language rather than
// the interface language. `i18n` is a component-local instance, so this touches this dialog alone.
function created() {
  if(this.file.language) this.$i18n.locale = this.file.language;
}

function dir() {
  return this.file.language=='ar' ? 'rtl' : 'ltr';
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

/* The page aligns text left, so Arabic needs it stated outright - inheriting `direction` from the
   dir attribute is not enough. The footer mirrors itself: it is flex, justified to the end. */
[dir="rtl"] .modal-content {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .modal-header .close {
  margin: -1rem auto -1rem -1rem;
}
</style>
