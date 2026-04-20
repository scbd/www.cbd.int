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
    parentDocumentId: { type: [String, Array], required: false },
    requestId: { type: String, required: false },
  },
  computed: {
    requestUrl() {
      const url = new URL(window.scbd.strataUrl);

      url.pathname = `/user-request/${this.requestId ?? 'new'}`;
      url.searchParams.set('returnUrl', window.location.href);
      if (this.meetingId) url.searchParams.set('meeting', this.meetingId);
      if (this.parentDocumentId && typeof (this.parentDocumentId) === 'string') url.searchParams.set('parentDocumentId', this.parentDocumentId);
      if (this.parentDocumentId && Array.isArray(this.parentDocumentId)) this.parentDocumentId.forEach((id) => url.searchParams.append('parentDocumentId', id));

      return url.toString();
    },
  },
}
</script>