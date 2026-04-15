<template>
    <a
      type="button"
      class="btn btn-light"
      :href="`${requestUrl}${requestPath}?${requestParams}`"
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
        meeting: { type: Object, required: false },
        parentDocumentId: { type: String, required: false },
        requestId: { type: String, required: false },
    },
    data: function () {
        return {
            requestUrl: window.scbd.strataUrl,
            requestPath: `/user-request/${this.requestId ?? 'new'}`,
            requestParams: `returnUrl=${encodeURIComponent(window.location.href)}${this.meetingId ? `&meeting=${encodeURIComponent(this.meetingId)}` : ''}${this.parentDocumentId ? `&parentDocumentId=${encodeURIComponent(this.parentDocumentId)}` : ''}`

        };
    },
}
</script>