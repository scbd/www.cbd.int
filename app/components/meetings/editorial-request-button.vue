<template>
  <a
    type="button"
    class="btn btn-light"
    :href="requestUrl"
  >
    <slot>
      <i class="fa fa-plus"></i>
    </slot>
  </a>
</template>

<script>
export default {
  name: 'EditorialRequestButton',
  props: {
    meetingId: { type: String, required: false },
    parentDocumentId: { type: String, required: false },
    requestId: { type: String, required: false },
  },
  computed: {
    requestUrl() {
      const url = new URL(window.scbd.strataUrl);

      url.pathname = `/user-request/${this.requestId ?? 'new'}`;
      url.searchParams.set('returnUrl', window.location.href);
      if (this.meetingId) url.searchParams.set('meeting', this.meetingId);
      if (this.parentDocumentId) url.searchParams.set('parentDocumentId', this.parentDocumentId);

      return url.toString();
    },
  },
}
</script>