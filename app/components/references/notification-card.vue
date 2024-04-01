<template>
    <div>
        <document-files 
            v-if="notification.files.length > 0"
            :files="notification.files"
            class="visible-xs pull-right" 
            style="padding-top:10px" />
        <b v-if="notification.number">({{ notification.number }})</b>
        <i>{{ notification.symbol }}</i> 
        <!-- <i v-if="notification.number">({{ notification.number }})</i> -->
        <div
            v-html="titleHtml"
            :title="title"
            style="max-height:50px;overflow:hidden" />
        <div v-if="notification.date">
            <i class="fa fa-calendar fa-fw"></i> 
            {{ fmtNotificationDate }}
        </div>
        <document-files
            :files="notification.files" 
            class="hidden-xs" 
            style="padding-top:10px" />
  </div>
</template>

<script>
import DocumentFiles from '~/components/references/document-files.vue';
import moment from 'moment-timezone';
import lstring from '~/filters/lstring.js';
import { sanitizeHtml } from '~/services/html';

export default {
    name: 'NotificationCard',
    components: {DocumentFiles},
    props: {
        notification: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        title() {
            const div = document.createElement('div')
            div.innerHTML = this.titleHtml;
            return div.innerText;
        },
        titleHtml() {
            const html = lstring(notification.title);
            return sanitizeHtml(html);
        },
        fmtNotificationDate() {
            const { notification } = this;
            if(notification && notification.date) {
                return moment.utc(notification.date).format('LL');
            }
            return '';
        }
    },
    filters: {lstring}
    
}
</script>

<style>

</style>